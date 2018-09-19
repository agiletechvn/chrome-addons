
function appendAccountItem(uid){
	// if not exist then append
	if($('#listAccount [uid=' + uid + ']').length <= 0){
		
                var groupUrl = $facebook.webUrl + 'groups/' + uid + '/members/';
                
                $.get(groupUrl, function(html){
                    // faster for regular
                    //var code = $($facebook.getHtml(html));
                    var title = html.match(/<title id="pageTitle">(.*?)<\/title>/);
                    var image = html.match(/<img class="coverPhotoImg photo img" src="([^"]+)"/);
                    var member = html.match(/<span class="_55pe" style="max-width:186px;">.*\(([\d,]+?)\)<\/span>/);
                    var ret = {
                        title:title ? title[1] : '',
                        member: member ? member[1] : 0,
                        image: image ? image[1] : 'group.png'
                    };
                    var str = '<li ';
                    str += 'uid="' + uid + '">'
                                    + '<div class="pull-left info"><img src="' + ret.image + '"'
                                    + 'class="img-thumbnail" alt="' + uid + '"/></div>' 
                                    + '<div class="pull-left action"><span class="pull-left labelAcc">'+(ret.title)+'</span> <br/>\n\
                                        <a href="'+groupUrl+'" class="pull-left"><span class="glyphicon glyphicon-user"></span>'+ret.member+' members</a>'
                                    + '</div>'
                                    + '<div class="pull-right action"><a href="javascript:void(0)" class="pull-right"><span class="glyphicon glyphicon-trash removeAcc"></span></a>'
                                    + '</div></li>';

                    $('#listAccount ul').append(str);
                    //code.empty();
                    //delete code;
                });
	}
}

$(function(){
	// get all facebook account & display
	var $listAccount 	= $('#listAccount ul');
	var fbUserIndexKey	= 'facebookGroupID';	
	var listUser            = $ls.get(fbUserIndexKey) || [];

        for(var i in listUser){
                appendAccountItem(listUser[i]);
        }		
	
	
	// append & store account real time
	
	// add account
	$('#btnAccountAdd').on('click', function(){
		// remove selected
		
		var gids = $('#txtGroupID').val().split(',');
                gids.forEach(function(gid){
                    gid = $.trim(gid);
                    // not found then insert
                    if(gid && $.inArray(gid, listUser) === -1){
                        listUser.push(gid);
                        $ls.set(fbUserIndexKey, listUser);
                        appendAccountItem(gid);
                    }
		
                });
		
		return false;
	});
	
	// remove account
	$listAccount.on('click', 'span.removeAcc', function(){
		var parent 					= $(this).closest('li');
		var uid						= $.trim(parent.attr('uid'));
		listUser = $.grep(listUser, function(value) {
                    return value !== uid;
                });
		// change store fbUserIndexKey
		$ls.set(fbUserIndexKey, listUser);
		parent.remove();
		
		return false;
	});
        
});