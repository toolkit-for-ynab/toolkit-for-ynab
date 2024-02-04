export default function random<T>(list: T[]) {
  return list[Math.floor(Math.random() * list.length)];
}
