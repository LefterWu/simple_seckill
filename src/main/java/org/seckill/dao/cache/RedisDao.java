package org.seckill.dao.cache;

import com.dyuproject.protostuff.LinkedBuffer;
import com.dyuproject.protostuff.ProtostuffIOUtil;
import com.dyuproject.protostuff.runtime.RuntimeSchema;
import org.seckill.entity.Seckill;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.JedisPool;

/**
 * Created by wuleshen on 19/01/12.
 */
public class RedisDao {
    private final Logger logger = LoggerFactory.getLogger(this.getClass());

    private final JedisPool jedisPool;

    private static final String SECKILLID_PREFIX = "seckill:";

    public RedisDao(String ip, int port) {
        jedisPool = new JedisPool(ip, port);
    }

    //protostuff提供的runtimeschema
    private RuntimeSchema<Seckill> schema = RuntimeSchema.createFrom(Seckill.class);

    /**
     * 从redis中取出seckill对象，利用protostuff序列化
     * @param seckillId
     * @return seckill对象
     */
    public Seckill getSeckill(long seckillId) {
        //redis操作逻辑
        try {
            Jedis jedis = jedisPool.getResource();
            try {
                String key = SECKILLID_PREFIX + seckillId;
                // redis并没有实现内部序列化操作
                // 采用自定义序列化 protostuff
                byte[] bytes = jedis.get(key.getBytes());
                //缓存中获取到bytes
                if (bytes != null) {
                    //protostuff将字节数组转化成一个pojo类空对象，进行反序列化
                    Seckill seckill = schema.newMessage(); //准备空对象用于接收
                    ProtostuffIOUtil.mergeFrom(bytes, seckill, schema);
                    //seckill 被反序列化
                    return seckill;
                }
            } finally {
                jedis.close();
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return null;
    }

    /**
     * 将seckill对象利用protostuff序列化后，存到redis中
     * @param seckill
     * @return
     */
    public String putSeckill(Seckill seckill) {
        try {
            Jedis jedis = jedisPool.getResource();
            try {
                String key = SECKILLID_PREFIX + seckill.getSeckillId();
                byte[] bytes = ProtostuffIOUtil.toByteArray(seckill, schema,
                        LinkedBuffer.allocate(LinkedBuffer.DEFAULT_BUFFER_SIZE));
                //set+expire 设置超时缓存
                int timeout = 60 * 60; //时间单位：秒
                String result = jedis.setex(key.getBytes(), timeout, bytes);
                return result;
            } finally {
                jedis.close();
            }
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
        }
        return null;
    }


}
