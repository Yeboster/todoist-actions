import { v9 as Todoist } from 'todoist'
import { TodoistApi } from '@doist/todoist-api-typescript'

import ChecklistIntegration from './integrations/checklists-integration'
import WorkIntegration from './integrations/work-integration'
import { TodoistClientType } from './types'
import SmartScheduleIntegration from './integrations/smart-schedule-integration'

const integrations = [
  new WorkIntegration(),
  new ChecklistIntegration()
  new SmartScheduleIntegration()
]

async function runWorkflows(syncClient: TodoistClientType, client: TodoistApi) {
  console.log('Syncing with Todoist...')
  await syncClient.sync(['items', 'projects', 'labels'])

  for (const integration of integrations) {
    console.log(`Running '${integration.name}' integration...`)
    await integration.run(syncClient, client)
  }

  console.log('Done!\n')
}

async function recurrentSetTimout(callback: () => void, delay: number) {
  await callback()
  setTimeout(() => recurrentSetTimout(callback, delay), delay)
}

async function main() {
  if (process.env.TODOIST_API_KEY == null)
    throw new Error('TODOIST_API_KEY is not set')

  console.log('*** Todoist Actions ***')
  const syncClient = Todoist(process.env.TODOIST_API_KEY)
  const restClient = new TodoistApi(process.env.TODOIST_API_KEY)

  await runWorkflows(syncClient, restClient)
  recurrentSetTimout(async () => await runWorkflows(syncClient, restClient), 5 * 60_000) // Every 5 minutes
}

main()
