package org.seckill.exception;

/**
 * 秒杀相关业务异常，通用异常
 * Created by wuleshen on 18/12/20.
 */
public class SeckillException extends RuntimeException {

    public SeckillException(String message) {
        super(message);
    }

    public SeckillException(String message, Throwable cause) {
        super(message, cause);
    }
}
