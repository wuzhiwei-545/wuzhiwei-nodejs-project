var regUser = /^\w{3,8}$/;
$('#regUser').focus(function(){
    $('.regUser').hide();
}).blur(function(){
    if(regUser.test($(this).val())){
        $('.regUser').hide();
    }else{
        $('.regUser').show();
    }
})

var regPass = /^\S{8,16}$/;
$('#regPass').focus(function(){
    $('.regPass').hide();
}).blur(function(){
    if(regPass.test($(this).val())){
        $('.regPass').hide();
    }else{
        $('.regPass').show();
    }
})

$('#regPwd').focus(function(){
    $('.regPwd').hide();
}).blur(function(){
    if($(this).val() == $('#regPass').val()){
        $('.regPwd').hide();
    }else{
        $('.regPwd').show();
    }
})

var regNic = /^\w{1,6}$/;
$('#regNic').focus(function(){
    $('.regNic').hide();
}).blur(function(){
    if(regNic.test($(this).val())){
        $('.regNic').hide();
    }else{
        $('.regNic').show();
    }
})

var regPhone = /^1[3578]\d{9}$/;
$('#regPhone').focus(function(){
    $('.regPhone').hide();
}).blur(function(){
    if(regPhone.test($(this).val())){
        $('.regPhone').hide();
    }else{
        $('.regPhone').show();
    }
})