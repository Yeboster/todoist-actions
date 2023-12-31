# Todoist Workflow Enhancements
This is a compilation of my custom workflows using the Todoist API, designed to boost my everyday productivity.

Each workflow is designed to operate with the following Todoist clients:
- Sync Client: This client is advantageous as it synchronizes all projects and tasks, thereby minimizing the number of API calls to Todoist. This is the preferred method.
- Official Todoist API: While offering a broader range of features compared to the sync client, this option necessitates a higher frequency of API calls, which elevates the risk of hitting rate limits.

While currently tailored to my specific requirements, I'm working on adapting it to be more universal, allowing you to develop your own efficient workflows.

## Deployment
The application is deployed on a Kubernetes cluster using Kustomize. 
It incorporates a Continuous Integration (CI) workflow that automatically updates the image version, ensuring the cluster consistently operates with the latest version.
