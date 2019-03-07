-- 数据库初始化脚本
-- select version();
-- +-----------+
-- | version() |
-- +-----------+
-- | 5.7.25    |
-- +-----------+
-- 创建数据库
CREATE DATABASE seckill;
-- 使用数据库
use seckill;
-- 创建秒杀库存表
CREATE TABLE `seckill` (
  `seckill_id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '商品库存id',
  `name` varchar(120) NOT NULL COMMENT '商品名称',
  `number` int(11) NOT NULL COMMENT '库存数量',
  `start_time` timestamp NOT NULL DEFAULT '1970-01-01 12:00:00' COMMENT '秒杀开启时间',
  `end_time` timestamp NOT NULL DEFAULT '1970-01-01 12:00:00' COMMENT '秒杀结束时间',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`seckill_id`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_end_time` (`end_time`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB AUTO_INCREMENT=1004 DEFAULT CHARSET=utf8 COMMENT='秒杀库存表';

-- 初始化数据
insert into
  seckill(name,number,start_time,end_time)
values
  ('7999元秒杀iphone XS MAX 256G',20,'2018-11-10 00:00:00','2018-11-12 00:00:00'),
  ('10999元秒杀sony a7rm3',10,'2019-01-01 00:00:00','2019-12-31 00:00:00'),
  ('1元秒杀小米充电宝',100,'2018-11-10 00:00:00','2018-11-12 00:00:00'),
  ('4999元秒杀微星GTX 1080Ti',50,'2019-06-17 00:00:00','2019-06-19 00:00:00');

-- 秒杀成功明细表
-- 用户登录认证相关的信息
CREATE TABLE `success_killed` (
  `seckill_id` bigint(20) NOT NULL COMMENT '秒杀商品id',
  `user_phone` varchar(20) NOT NULL COMMENT '用户手机号',
  `state` tinyint(4) NOT NULL DEFAULT '-1' COMMENT '状态标示:-1:无效 0:成功 1:已付款 2:已发货',
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`seckill_id`,`user_phone`), /*联合主键，防止重复插入*/
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='秒杀成功明细表';



