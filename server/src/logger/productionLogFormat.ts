import winston from 'winston';

export const productionLogFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss.SSS' }),
  winston.format.simple(),
  winston.format.json(),
  winston.format.printf((info) => {
    if (info.level) {
      info.level = info.level.toUpperCase(); // 로그 레벨을 대문자로 변환
    }

    if (info['span_id']) {
      info['spanId'] = info['span_id'];
      delete info['span_id'];
    }

    if (info['trace_id']) {
      info['traceId'] = info['trace_id'];
      delete info['trace_id'];
    }

    return JSON.stringify(info);
  }),
);
