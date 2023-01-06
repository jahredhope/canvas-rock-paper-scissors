// @ts-expect-error import isn't liking the query param
import Worker from "./worker/entry?worker";

export function createWorker() {
  return new Worker();
}
