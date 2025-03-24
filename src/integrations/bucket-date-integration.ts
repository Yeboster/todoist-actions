import IIntegration from "../integration";
import { TodoistClientType } from "../types";
import { TodoistApi } from '@doist/todoist-api-typescript';

export class BucketDateIntegration implements IIntegration {
  get name() {
    return 'Bucket Date'
  }

  async run(syncClient: TodoistClientType, restClient: TodoistApi) {
    const buckets = Object.keys(this.bucketLabelsMap)
    const tasksWithBucket = syncClient.items!.get().filter((task) => task.labels.find((label: string) => buckets.includes(label)))

    for (const task of tasksWithBucket) {
      const bucketLabel: string = task.labels.find((label: string) => buckets.includes(label))
      if (!bucketLabel) continue

      const bucketDate = this.bucketLabelsMap[bucketLabel]
      if (task.due?.date === bucketDate) continue

      await syncClient.items!.update({ id: task.id, due: { date: bucketDate } })
    }
  }

  private get bucketLabelsMap(): Record<string, string> {
    const today = new Date()
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay()))
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    endOfMonth.setDate(endOfMonth.getDate() - 1)

    const endOfQuarter = new Date(today.getFullYear(), today.getMonth() + 3, 1)

    return {
      'this-week': this.formatDateToMilitaryFormat(endOfWeek),
      'this-month': this.formatDateToMilitaryFormat(endOfMonth),
      'next-month': this.formatDateToMilitaryFormat(endOfMonth),
      'this-quarter': this.formatDateToMilitaryFormat(endOfQuarter),
    }
  }

  private formatDateToMilitaryFormat(date: Date) {
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${date.getFullYear()}-${month}-${day}`
  }
}
