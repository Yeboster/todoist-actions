import { TodoistApi } from "@doist/todoist-api-typescript"
import IIntegration from "../integration"
import { TodoistClientType } from "../types"

import * as chrono from 'chrono-node'

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

      const newDueDate = datePatternMatch[0].replace('@', '')

      const parsedDate = chrono.parseDate(newDueDate)
      parsedDate.setMinutes(parsedDate.getMinutes() + this.defaultTaskDurationInMinutes)
      const formattedDate = this.formatDate(parsedDate)

      const taskDueDate = chrono.parseDate(task.due?.string ?? '')

      if (formattedDate === this.formatDate(taskDueDate)) continue

      await restClient.updateTask(task.id, { dueString: formattedDate })
    }
  }

  get defaultTaskDurationInMinutes() {
    return 45
  }

  formatDate(date: Date) {
    return date.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
}
