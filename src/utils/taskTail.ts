class TaskTail {
    _tail: Array<Promise<undefined>> = [];

    constructor() {}

    addTask(task: Promise<undefined>) {
        this._tail.push(task);
    }

    async waitTailComplete() {
        return Promise.all(this._tail);
    }
}

export default TaskTail;