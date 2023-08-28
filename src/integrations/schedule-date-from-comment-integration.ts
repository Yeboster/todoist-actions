import { TodoistApi } from "@doist/todoist-api-typescript";
import IIntegration from "../integration";
import { TodoistClientType } from "../types";

export default class ScheduleDateFromComment implements IIntegration {
  get name() {
    return "Schedule date from comment"
  }

  // Schedule tasks with due date and comments
  // Given a comment with the following date format (e.g. Sep 06 @ 1:15 PM)
  async run(syncClient: TodoistClientType, restClient: TodoistApi) {
    const tasksWithDateAndLabel = await restClient.getTasks({ filter: '!no date & !recurring & !no labels' })

    const tasksWithDueDateAndComment = tasksWithDateAndLabel.filter((task) => task.commentCount > 0)

    for (const task of tasksWithDueDateAndComment) {
      const comments = await restClient.getComments({ taskId: task.id })

      // Matches the following format Sep 06 @ 1:15 PM)
      const datePattern = /((\w|\s)+@\s.*(AM|PM))/g
      const commentsWithDatePattern = comments.filter((comment) => datePattern.test(comment.content))

      if (commentsWithDatePattern.length === 0) continue

      const commentWithDatePattern = commentsWithDatePattern[0]

      const datePatternMatch = commentWithDatePattern.content.match(datePattern)
      if (datePatternMatch == null) continue

      const newDueDate = datePatternMatch[0]

      await restClient.updateTask(task.id, { dueString: newDueDate })
    }
  }
}
