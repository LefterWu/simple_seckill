//存放主要交互逻辑js代码
// javascript 模块化
var seckill = {
    //封装秒杀相关ajax的url
    URL: {
        now: function () {
            return '/seckill/time/now';
        },
        exposer: function (seckillId) {
            return '/seckill/' + seckillId + '/exposer';
        },
        execution: function (seckillId, md5) {
            return '/seckill/' + seckillId + '/' + md5 + '/execution';
        }
    },
    //执行秒杀交互
    handleSeckill: function (seckillId, node) {
        //获取秒杀地址，控制显示逻辑 ，执行秒杀
        node.hide()
            .html('<button class="btn btn-primary btn-lg" id="killBtn">开始秒杀</button>');//按钮
        $.post(seckill.URL.exposer(seckillId), {}, function (result) {
            //在回调函数中，执行交互流程
            if (result && result['success']) {
                var exposer = result['data'];
                if (exposer['exposed']) {
                    //开启秒杀
                    //获取秒杀地址
                    var md5 = exposer['md5'];
                    var killUrl = seckill.URL.execution(seckillId, md5);
                    console.log("killUrl:" + killUrl);
                    //绑定一次点击事件，防止后台处理大量重复点击请求
                    $('#killBtn').one('click', function () {
                        //执行秒杀请求
                        //1:先禁用按钮
                        $(this).addClass('disabled');
                        //2:发送秒杀请求执行秒杀
                        $.post(killUrl, {}, function (result) {
                            if (result && result['success']) {
                                var seckillExecution = result['data'];
                                var state = seckillExecution['state'];
                                var stateInfo = seckillExecution['stateInfo'];
                                //3:显示秒杀结果
                                node.html('<span class="label label-success">' + stateInfo + '</span>');
                            }
                        });
                    });
                    node.show();
                } else {
                    //未开启秒杀(可能由于客户端的服务器时间不一致)
                    var now = exposer['now'];
                    var start = exposer['start'];
                    var end = exposer['end'];
                    //重新计算计时逻辑
                    seckill.countdown(seckillId, now, start, end);
                }
            } else {
                console.log('result:' + result);
            }

        });
    },
    //验证手机号
    //TODO 后期改为账号验证
    validatePhone: function (phone) {
        if ((/^1[34578]\d{9}$/.test(phone))) {
            return true;
        } else {
            return false;
        }
    },
    //倒计时
    countdown: function (seckillId, nowTime, startTime, endTime) {
        var seckillBox = $('#seckill-box');
        //时间判断
        if (nowTime > endTime) {
            //秒杀结束
            seckillBox.html('秒杀结束!');
        } else if (nowTime < startTime) {
            //秒杀未开始,计时事件绑定
            var killTime = new Date(startTime + 1000);
            seckillBox.countdown(killTime, function (event) {
                //时间格式
                var format = event.strftime('距离秒杀开始还剩: %D天 %H时 %M分 %S秒');
                seckillBox.html(format);
                //倒计时完成后的回调事件
            }).on('finish.countdown', function () {
                //倒计时结束后进行秒杀业务
                seckill.handleSeckill(seckillId, seckillBox);
            });
        } else {
            //秒杀开始
            seckill.handleSeckill(seckillId, seckillBox);
        }
    },
    //详情页秒杀逻辑
    detail: {
        //详情页初始化
        init: function (params) {
            //手机验证和登录 , 计时交互
            //在cookie中查找手机号
            var killPhone = $.cookie('killPhone');
            //验证手机号
            if (!seckill.validatePhone(killPhone)) {
                //如果未登录，绑定phone
                //选择页面的弹出框
                var killPhoneModal = $('#killPhoneModal');
                //显示弹出框
                killPhoneModal.modal({
                    show: true,//弹出框默认为关闭，显示弹出框
                    backdrop: 'static',//禁止位置关闭,防止用户点击别的位置导致关闭该弹出框
                    keyboard: false//关闭键盘事件，防止误操作关闭弹出框
                });
                //点击弹出框按钮
                $('#killPhoneBtn').click(function () {
                    var inputPhone = $('#killPhoneKey').val();
                    console.log('inputPhone=' + inputPhone);//TODO
                    if (seckill.validatePhone(inputPhone)) {
                        //写入cookie, 有效期7天
                        $.cookie('killPhone', inputPhone, {expires: 7, path: '/seckill'});
                        //刷新页面
                        window.location.reload();
                    } else {
                        $('#killPhoneMessage').hide().html('<label class="label label-danger">手机号错误!</label>').show(300);
                    }
                });
            }
            //已经登录
            //计时交互
            var startTime = params.startTime;
            var endTime = params.endTime;
            var seckillId = params.seckillId;
            $.get(seckill.URL.now(), {}, function (result) {
                if (result && result['success']) {
                    var nowTime = result['data'];
                    //时间判断,计时交互
                    seckill.countdown(seckillId, nowTime, startTime, endTime);
                } else {
                    console.log('result:' + result);
                }
            });
        }
    }
}