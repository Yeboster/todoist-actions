import { TodoistClientType } from "./types";
import { TodoistApi } from "@doist/todoist-api-typescript";


export default interface IIntegration {
  get name(): string
  run(syncClient: TodoistClientType, restClient: TodoistApi): Promise<void>
}
