//浏览器里面处理 手机管理 页面的 js 文件
var page = 1;
var pageSize = 2;

//获取手机列表信息
function getList(){
    $.get('/mobile/list',{
        page: page,
        pageSize: pageSize
    },function(result){
        console.log(result);
        if(result.code === 100){
            var list = result.data.list;
            var totalPage = result.data.totalPage;
            var str = '';
            for(var i=0;i<list.length;i++){
                str += `<tr>
                    <td>${i+1}</td>
                    <td><img src="/mobiles/${list[i].fileName}"/></td>
                    <td>${list[i].mobileName}</td>
                    <td>${list[i].brand}</td>
                    <td>${list[i].officialPrice}</td>
                    <td>${list[i].secondPrice}</td>
                    <td>
                        <a href="#">修改</a>
                        <a href="#">删除</a>
                    </td>
                </tr>`;
            }
            var pageStr = '';
            for(var i=0;i<totalPage;i++){
                pageStr += `<li><span>${i+1}</span></li>`;
            }
            $('tbody').html(str);
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
    
    // 默认调用一下getList()
    getList();
    $("#addPhone").click(function(){
        $(".addPhoneWrap").show();
    })
    $(".cancel").click(function(){
        $(".addPhoneWrap").hide();
    })

    $(".sure").click(function(){
        //新增手机 使用 ajax 的方法 post 请求 $.ajax

        //自己模拟form表单
        var formData = new FormData();
        formData.append('mobileName',$('#mobileName').val());
        formData.append('brand',$('#brand').val());
        formData.append('officialPrice',$('#officialPrice').val());
        formData.append('secondPrice',$('#secondPrice').val());
        formData.append('mobileImg',$('#mobileImg')[0].files[0]); //传送图片要改成dom对象.files[0]
        $.ajax({
            url: 'mobile/add',
            method: 'post',
            data: formData,
            contentType: false,
            processData: false,
            success: function(result){
                if(result.code === 100){
                    $('.addPhoneWrap').hide();
                    // 主动调用getList 方法
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
        console.log(page);
        getList();
    })
})