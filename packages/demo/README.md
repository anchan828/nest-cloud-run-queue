# @anchan828/nest-cloud-run-common

THis is demo repository

## Usage

## Install packages

```bash
npm i
```

## Run docker-compose services

```bash
$ npm i
$ docker-compose up
```


### Access http://localhost:3000/pubsub

```ts
@CloudRunQueueWorker("pubsub")
export class PubSubWorker {
  @CloudRunQueueWorkerProcess()
  public async process(message: string, raw: CloudRunQueueWorkerRawMessage): Promise<void> {
    console.log("pubsub", message, raw);
  }
}
```

<img width="823" alt="9e29b5c3b998e6b78bcd2b8a15a3f4c9" src="https://user-images.githubusercontent.com/694454/164208898-86e81a94-cfad-42b5-8952-9ffaf1191dc2.png">


### Access http://localhost:3000/tasks

```ts
@CloudRunQueueWorker("tasks")
export class TasksWorker {
  @CloudRunQueueWorkerProcess()
  public async process(message: string, raw: CloudRunQueueWorkerRawMessage): Promise<void> {
    console.log("tasks", message, raw);
  }
}
```

<img width="777" alt="813283a6a247ce98d987abe836deda04" src="https://user-images.githubusercontent.com/694454/164208835-074e1c03-df94-410e-b144-121d745b4bdd.png">
