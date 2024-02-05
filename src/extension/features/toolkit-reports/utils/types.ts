// We can attach arbitrary data to point, but Highchart types doesn't support this
// So this utility class makes it a lot easier to manually cast Point to correct type
export type PointWithPayload<T extends object> = Highcharts.Point & T;
