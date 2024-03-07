import moment from 'moment';
import cron from 'node-cron';
import {taskType} from 'src/@types/task';
import TaskNotification from 'src/database/Models/taskNotification.model';
import Task from 'src/database/Models/tasks.model';
import {fetchUserById} from 'src/queries/users.queries';

// ? ==================================
// ? Gestion de la date butoir dépassée
// ? ==================================

/**
 * Création d'une notification après la date butoir de validation
 */
async function createTaskDelayNotification(task: taskType) {
  const notification = new TaskNotification({
    task: task._id,
    notificationType: 'TaskDelay',
    content: `La tâche ${ task.title } est en retard`
  });
  await notification.save();
}

/**
 * Tous les jours, on vérifie les taches qui ont la date butoir dépassée
 * On crée une notification si on en trouve
 */
cron.schedule('0 0 * * *', async () => {
  const overdueTasks = await Task.find({
    validated: false,
    dueDate: {$lt: new Date()}
  });

  overdueTasks.forEach((task) => {
    createTaskDelayNotification(task);
  });
});

// ? ==================================
// ? Mise à jour des taches répétitives
// ? ==================================

const STATUS_COMPLETED = 'completed';
const STATUS_PENDING = 'pending';
const CHECKING_PERIODS = {
  daily: 1,
  weekly: 5,
  biMonthly: 10,
  monthly: 15,
  biAnnually: 91,
  annually: 182
};
const SEARCH_CRITERIA: { [key: string]: any } = {};
Object.keys(CHECKING_PERIODS).forEach((recurrence) => {
  SEARCH_CRITERIA[recurrence] = {status: STATUS_COMPLETED, recurrence};
});

/**
 * Returns the next work day based on the given date and direction.
 *
 * @param {moment.Moment} date - The starting date.
 * @param {boolean} isForward - If true, searches for the next work day after the given date.
 *                              If false, searches for the previous work day before the given date.
 * @return {Date} - The next work day as a Date object.
 */
function getNextWorkDay(date: moment.Moment, isForward: boolean, nonWorkingDays: number[]) {
  const step = isForward ? 1 : -1;
  let nextWorkDay = date.clone();

  while (nonWorkingDays.includes(nextWorkDay.day())) {
    nextWorkDay = nextWorkDay.add(step, 'days');
  }

  return nextWorkDay.toDate();
}

/**
 * Updates the status and due date of a task based on its recurrence
 *
 * @param {taskType} task - The task object to update
 * @param {object} options - The options object containing the recurrence
 * @param {string} options.recurrence - The recurrence of the task (daily, weekly, biMonthly, monthly, annually,
 *   biAnnually)
 *
 * @return {Promise<void>} - A promise that resolves when the task status is updated
 */
async function updateTaskStatus(task: taskType, {recurrence, nonWorkingDays}: { recurrence: string, nonWorkingDays: number[] }) {
  const completedDate = moment(task.doneDate);
  const daysDiff = moment().diff(completedDate, 'days');

  if (recurrence === 'daily' && daysDiff >= CHECKING_PERIODS.daily) {
    task.status = STATUS_PENDING;
    task.dueDate = getNextWorkDay(moment(), true, nonWorkingDays);
  } else if (recurrence === 'weekly' && moment().isoWeek() - completedDate.isoWeek() >= 1) {
    task.status = STATUS_PENDING;
    task.dueDate = getNextWorkDay(moment().endOf('isoWeek'), false, nonWorkingDays);
  } else if (recurrence === 'biMonthly' && moment().isoWeek() - completedDate.isoWeek() >= 2) {
    task.status = STATUS_PENDING;
    task.dueDate = getNextWorkDay(moment().add(1, 'weeks').endOf('isoWeek'), false, nonWorkingDays);
  } else if (recurrence === 'monthly' && moment().month() - completedDate.month() >= 1) {
    task.status = STATUS_PENDING;
    task.dueDate = getNextWorkDay(moment().endOf('month'), false, nonWorkingDays);
  } else if (recurrence === 'annually' && moment().year() - completedDate.year() >= 1) {
    task.status = STATUS_PENDING;
    task.dueDate = getNextWorkDay(moment().endOf('year'), false, nonWorkingDays);
  } else if (recurrence === 'biAnnually' && moment().month() - completedDate.month() >= 3) {
    task.status = STATUS_PENDING;
    task.dueDate = getNextWorkDay(moment().add(2, 'months').endOf('month'), false, nonWorkingDays);
  }

  if (task.status === STATUS_PENDING) {
    await Task.findOneAndUpdate({_id: task._id}, task);
  }
}

/**
 * Process tasks based on the specified recurrence.
 *
 * @param {string} recurrence - The recurrence type to filter tasks.
 * @return {Promise} - A promise that resolves when all tasks have been updated.
 */
async function processTasks(recurrence: string) {
  const tasks = await Task.find(SEARCH_CRITERIA[recurrence]);

  const taskPromises = tasks.map(async task => {
    const user = await fetchUserById(String(task.assignedTo));
    if (user) updateTaskStatus(task, {recurrence, nonWorkingDays: user.nonWorkingDays!});
  });

  await Promise.all(taskPromises);
}

/**
 * On lance un cron tous les jours à minuit, pour réinitialiser les taches complétées
 */
cron.schedule('0 0 * * *', async () => {
  await processTasks('daily');
  await processTasks('weekly');
  await processTasks('biMonthly');
  await processTasks('monthly');
  await processTasks('biAnnually');
  await processTasks('annually');
});
