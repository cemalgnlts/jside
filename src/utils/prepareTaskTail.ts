enum TaskType {
	// OFFLINE = "offline",
	LAYOUT = "layout",
	SERVICE = "service",
	PRELOAD = "preload"
}

interface ITask {
	promise: Promise<undefined>;
	resolve: () => void;
	reject: () => void;
}

const tail: Record<TaskType, ITask> = {
	// [TaskType.OFFLINE]: withPromise(),
	[TaskType.LAYOUT]: withPromise(),
	[TaskType.SERVICE]: withPromise(),
	[TaskType.PRELOAD]: withPromise()
};

function freeTask(type: TaskType) {
	tail[type].resolve();
}

async function waitTailComplete() {
	const promises = Object.values(tail).map((tail) => tail.promise);

	return Promise.all(promises);
}

function withPromise(): ITask {
	let resolve = () => {};
	let reject = () => {};

	const promise = new Promise<undefined>((res, rej) => {
		resolve = res as () => void;
		reject = rej;
	});

	return { promise, resolve, reject };
}

export { freeTask, waitTailComplete, TaskType };
