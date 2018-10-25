//浏览器里面处理 品牌页面 的 js 文件
var page = 1;
var pageSize = 2;

//获取品牌列表信息
function getList(){
    $.get('/brand/list',{
        page: page,
        pageSize: pageSize
    },function(result){
        if(result.code === 100){
            var list = result.data.list;
            var totalPage = result.data.totalPage;
            var str = '';
            for(var i=0;i<list.length;i++){
                str += `<tr>
                            <td>${i+1}</td>
                            <td><img src="/mobiles/${list[i].logoImg}" /></td>
                            <td>${list[i].brand}</td>
                            <td>
                                <a href="#" id="change">修改</a>
                                <a href="#" id="delete">删除</a>
                            </td>
                            <td class="none">${list[i].logoImg}</td>
                        </tr>`
            }
            $('tbody').html(str);
            var pageStr = '';
            for(var i=0;i<totalPage;i++){
                pageStr += `<li><span>${i+1}</span></li>`;
            }
            var html = `<li>
                            <a href="#" aria-label="Previous">
                                <span aria-hidden="true">&laquo;</span>
                            </a>
                        </li>
                        ${pageStr}
                        <li>
                            <a href="#" aria-label="Next">
                            <span aria-hidden="true">&raquo;</span>
                            </a>
                        </li>`;
            $('.pagination').html(html);
        }
    })
}

$(function(){
    getList();
    $('#addPhone').click(function(){
        $('.addPhoneWrap').show();
    })
    $('.cancel').click(function(){
        $('.addPhoneWrap').hide();
    })
    $('.sure').click(function(){
        //模拟form表单
        var formData = new FormData();
        formData.append('brand',$('#brand').val());
        formData.append('logoImg',$('#logoImg')[0].files[0]);
        $.ajax({
            url: 'brand/add',
            method: 'post',
            data: formData,
            contentType: false,
            processData: false,
            success: function(result){
                if(result.code === 100){
                    $('.addPhoneWrap').hide();
                    getList();
                }else{
                    alert(result.msg);
                }
            },
            error: function(){

            }
        })
    })
    $(".pagination").on("click","li",function(){
        page = $(this).children().html();
        // console.log(page);
        getList();
    })
    //删除事件
    $('table').on('click','#delete',function(){
        var deleteName = $(this).parent().parent().find('.none').html();
        $.get('/brand/delete',{logoImg:deleteName},function(result){
            if(result.code === 100){
                getList();
            }
        })
    })

//修改事件
    $('table').on('click','#change',function(){
        $('#update').show();
        $('#cBrand').val($(this).parent().parent().children('td:nth-child(3)').html());
        var logo = $(this).parent().parent().find('.none').html();
        $('#sure').click(function(){
            var formData = new FormData();
            formData.append('brand',$('#cBrand').val());
            formData.append('logo',logo);
            formData.append('logoImg',$('#cImg')[0].files[0]);
            $.ajax({
                url: '/brand/update',
                method: 'post',
                data: formData,
                contentType: false,
                processData: false,
                success: function(result){
                    if(result.code == 100){
                        $('#update').hide();
                        getList();
                    }
                },
                error: function(){

                }
            })
        })
    })

    $('.cancel').click(function(){
        $('#update').hide();
    })
    
    //高亮
    $('#lightBrand').css('color','#52cbc5');
    
})