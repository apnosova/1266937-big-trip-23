import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import isBetween from 'dayjs/plugin/isBetween';
import {TimeFormatDisplay} from '../constants';

dayjs.extend(duration);
dayjs.extend(isBetween);

export const humanizeEventDate = (date, format) => date ? dayjs(date).format(format) : '';

export const getEventDuration = (startTime, endTime) => {

  const differenceInMs = dayjs(endTime).diff(dayjs(startTime));
  const durationInMs = dayjs.duration(differenceInMs);

  const hours = durationInMs.hours();
  const minutes = durationInMs.minutes();
  const days = Math.trunc(durationInMs.asDays());

  let formattedDuration;

  if (!days && !hours) {
    formattedDuration = durationInMs.format(TimeFormatDisplay.DURATION_MINUTES);
  } else if (hours && !days) {
    formattedDuration = durationInMs.format(TimeFormatDisplay.DURATION_HOURS);
  } else {
    formattedDuration = `${days.toString().padStart(2, 0)}D ${hours.toString().padStart(2, 0)}H ${minutes.toString().padStart(2, 0)}M`;
  }

  return formattedDuration;
};

export const isFutureEvent = (startTime) => (
  dayjs().isBefore(startTime, 'D')
);

export const isPresentEvent = (startTime, endTime) => (
  dayjs().isBetween(startTime, endTime, 'D', '[]')
);

export const isPastEvent = (endTime) => (
  dayjs().isAfter(endTime, 'D')
);

export const sortEventsByDate = (eventA, eventB) => (
  dayjs(eventA.startTime).diff(dayjs(eventB.startTime))
);

export const sortEventsByDuration = (eventA, eventB) => (
  dayjs(eventB.endTime).diff(dayjs(eventB.startTime)) - dayjs(eventA.endTime).diff(dayjs(eventA.startTime))
);

export const sortEventsByPrice = (eventA, eventB) => (
  eventB.price - eventA.price
);
