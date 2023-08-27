import { TodoistApi } from "@doist/todoist-api-typescript";
import IIntegration from "../integration";
import { TodoistClientType } from "../types";

export default class SmartScheduleIntegration implements IIntegration {
  get name() {
    return "Smart Schedule"
  }

  // Schedule tasks with due date and comments
  // Given a comment with the following date format (e.g. Sep 06 @ 1:15 PM)
  async run(syncClient: TodoistClientType, restClient: TodoistApi) {
    const tasksWithDueDate = syncClient.items!.get().filter((item) => {
      const hasDueDate = item.due && item.due.date
      return hasDueDate
    })

    const restTasks = await restClient.getTasks({ ids: tasksWithDueDate.map((task) => task.id) })

    const tasksWithDueDateAndComment = restTasks.filter((task) => {
      const hasComment = task.commentCount > 0
      return hasComment
    })

    for (const task of tasksWithDueDateAndComment) {
      const comments = await restClient.getComments({ taskId: task.id })

      // Matches the following format Sep 06 @ 1:15 PM)
      const datePattern = /((\w|\s)+@\s.*(AM|PM))/g
      const commentsWithDatePattern = comments.filter((comment) => {
        return datePattern.test(comment.content)
      })

      if (commentsWithDatePattern.length === 0) return

      const commentWithDatePattern = commentsWithDatePattern[0]

      const datePatternMatch = commentWithDatePattern.content.match(datePattern)
      if (datePatternMatch == null) return

      const newDueDate = datePatternMatch[0]

      await restClient.updateTask(task.id, { dueString: newDueDate })
    }
  }
}
