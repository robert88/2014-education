var drag_active_obj=null;
var matching1_active_obj=null;
var matching2_active_obj=null;
var isInIframe=false;
var tmp_que_idx=0;
var clone_drag_obj=null;
var sortable_obj_count=0;

var fun_meic_submited=false;
var fun_meic_before_answer=false;
var fun_meic_after_answer=false;
var fun_meic_answered=false;
var fun_meic_show_result=false;
var fun_meic_page_refresh=false;

var storage_tmp_name='meic_tmp_'+res_id+'_'+res_idx;

//meic_answer_statistics
var auto_submit=0;
var auto_save=0;
var profile=3;
var answered_user_show=false;


var hasStorage = (function() {
      try {
        localStorage.setItem('try_test', 1);
        localStorage.removeItem('try_test');
        return true;
      } catch(e) {
        return false;
      }
}());


$(document).ready(function(){

	isInIframe = (window.location != window.parent.location && top.post_mode==0) ? true : false;
	if(typeof meic_submited == 'function'){
		fun_meic_submited=true;
	}
	if(typeof meic_before_answer == 'function'){
		fun_meic_before_answer=true;
	}
	if(typeof meic_after_answer == 'function'){
		fun_meic_after_answer=true;
	}
	if(typeof meic_answered == 'function'){
		fun_meic_answered=true;
	}
	if(typeof meic_show_result == 'function'){
		fun_meic_show_result=true;
	}
	if(typeof meic_page_refresh == 'function'){
		fun_meic_page_refresh=true;
	}
	if (isInIframe){
		setting_real_time_show_correct=top.$show_correct;
		setting_show_correct_answer=top.$show_answer;
		setting_redo_times=top.$redo_times;
		profile=top.$up_id;
		//if (profile==2){
		//	auto_submit=0;
		//}else{
			auto_submit=parseInt(top.$auto_submit);
		//}
		auto_save=parseInt(top.$auto_save);
	}else{
		profile=user_type;
	}

	sortable_obj_count=$( ".answer_sort,.answer_sort2" ).length;
	if (sortable_obj_count>0){
		$( ".answer_sort" ).sortable({
			stop: function(event, ui) {
				que_idx=$(this).attr('que_index');
				$(this).find('.input_answer[que_index="'+que_idx+'"]').each(function(j, obj) {
					ans_idx=j+1;
					$(obj).attr('ans_index',ans_idx);
					answer=$.trim($(obj).html());
					var ret=save_answer(que_idx,ans_idx,answer,-2,1);
					if (ret){
						show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,null,ret.corr_answer,ret.times,true);
					}

				});
				$(this).find('.correct_answer[que_index="'+que_idx+'"]').each(function(j, obj) {
					$(obj).attr('ans_index',(j+1));
				});
			}
		});

	    $('.answer_sort li').sort(function(){ return Math.random() - .5; }).each(
		function(i,obj){
			que_idx=$(obj).attr('que_index');
		    $('.answer_sort[que_index="'+que_idx+'"]').append(this);
		}
	    );
		$( ".answer_sort" ).each(function(i, obj) {
			que_idx=$(obj).attr('que_index');
			$(this).find('.input_answer[que_index="'+que_idx+'"]').each(function(j, obj2) {
					ans_idx=j+1;
					$(obj2).attr('ans_index',ans_idx);
			});
			$(this).find('.correct_answer[que_index="'+que_idx+'"]').each(function(j, obj2) {
				$(obj2).attr('ans_index',(j+1));
			});
		});
	    $('.answer_sort').find('.answer').show();
	}



	sortable_obj2_count=$( ".answer_sort2" ).length;
	if (sortable_obj2_count>0){
		$( ".answer_sort2" ).sortable({
			stop: function(event, ui) {
				que_idx=$(this).attr('que_index');
				$(this).find('.input_answer[que_index="'+que_idx+'"]').each(function(j, obj) {
					ans_idx=j+1;
					$(obj).attr('ans_index',ans_idx);
					answer=$.trim($(obj).html());
					var ret=save_answer(que_idx,ans_idx,answer,-2,1);
					if (ret){
						show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,null,ret.corr_answer,ret.times,true);
					}

				});
				$(this).find('.correct_answer[que_index="'+que_idx+'"]').each(function(j, obj) {
					$(obj).attr('ans_index',(j+1));
				});
			}
		});

	    $('.answer_sort2 li').sort(function(){ return Math.random() - .5; }).each(
		function(i,obj){
			que_idx=$(obj).attr('que_index');
		    $('.answer_sort2[que_index="'+que_idx+'"]').append(this);
		}
	    );
		$( ".answer_sort2" ).each(function(i, obj) {
			que_idx=$(obj).attr('que_index');
			$(this).find('.input_answer[que_index="'+que_idx+'"]').each(function(j, obj2) {
					ans_idx=j+1;
					$(obj2).attr('ans_index',ans_idx);
			});
			$(this).find('.correct_answer[que_index="'+que_idx+'"]').each(function(j, obj2) {
				$(obj2).attr('ans_index',(j+1));
			});
		});


	    $('.answer_sort2').find('.answer').show();
	}


	$( ".drag[clone_drag!=1]" ).draggable({
		snap: ".drop", snapMode: "inner",
		revert: true,
		start:function( event, ui ) {
			drag_active_obj=null;
			$(this).removeClass('drag_active');
			$(this).draggable( "option", "revert", false );

		},
		stop:function( event, ui ) {
			if (!$(this).attr('droped_ans_idx')){
				org_top=$(this).attr('org_top');
				org_left=$(this).attr('org_left');
				$(this).offset({ top: org_top, left: org_left });
				$(this).draggable( "option", "revert", true );
				$(this).removeClass('drag_active');
			}
		}
	});
	$( ".drag[clone_drag=1]" ).draggable({
		snap: ".drop", snapMode: "inner",
		revert: true,
		helper: 'clone',
		start:function( event, ui ) {
			drag_active_obj=null;
			$(this).removeClass('drag_active');
			$(this).draggable( "option", "revert", false );
		},
		stop:function( event, ui ) {
			if (!$(this).attr('droped_ans_idx')){
				org_top=$(this).attr('org_top');
				org_left=$(this).attr('org_left');
				$(this).offset({ top: org_top, left: org_left });
				$(this).draggable( "option", "revert", true );
				$(this).removeClass('drag_active');
			}
		}
	});

	$( ".drop" ).droppable({
		drop: function( event, ui ) {
			//if (!$(this).attr('droped_ans_idx') || $(this).attr('que_style')==6){
			if (!$(this).attr('droped_ans_idx') || $(this).attr('multiple_drop')==1){
				var ret=drop_to(ui.draggable,$(this),true);
				if(typeof meic_drop_in == 'function'){
					meic_drop_in(ui.draggable,$(this),clone_drag_obj);
				}
				if (ret){
					show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
				}
			}

		},
		out: function( event, ui ) {
			if ($(ui.draggable).attr('droped_ans_idx')){
				if(typeof meic_drop_out == 'function'){
					meic_drop_out(ui.draggable,$(this));
				}
				$(ui.draggable).attr('droped_ans_idx','');
				$(this).attr('droped_ans_idx','');
				$(ui.draggable).attr('droped_que_idx','');
				$(this).attr('droped_que_idx','');
				var que_style=$(this).attr('que_style');

				var que_idx=$(this).attr('que_index');
				var ans_idx=$(this).attr('ans_index');
				if (que_style==6){
					answer=get_FIB6_answer(que_idx,ans_idx);
				}else{
					answer='';
				}
				var ret=save_answer(que_idx,ans_idx,answer,-2,1);
				if (ret){
					show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,null,ret.corr_answer,ret.times,true);
				}
			}
		}
	});

	initEngine();
	if(fun_meic_page_refresh){
		meic_page_refresh();
	}


	$( ".drag" ).click(function(){
		$('.drag').removeClass('drag_active');
		if (!$(this).attr('droped_ans_idx')){
			$(this).addClass('drag_active');
			drag_active_obj=$(this);
		}
	});
	$( ".drop" ).click(function(){
		if (drag_active_obj && (!$(this).attr('droped_ans_idx') || $(this).attr('multiple_drop')==1)){
			var ret=drop_to(drag_active_obj,$(this),true);
			if (ret){
				show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
			}
		}
	});

	$("input[type='radio']").click(function() {
		var que_idx=$(this).attr('que_index');
		var ans_idx=$(this).attr('ans_index');
		var answer=$(this).val();
		var ret=save_answer(que_idx,ans_idx,answer,-2,1);
		if (ret){
			show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
		}
	});

	$("input[type='checkbox']").click(function() {
		var que_idx=$(this).attr('que_index');
		var ans_idx=$(this).attr('ans_index');
		var answer=0;
		if  ($('input[type="checkbox"][que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').is(':checked')){answer=1;}
		var ret=save_answer(que_idx,ans_idx,answer,-2,1);
		if (ret){
			show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
		}
	});


	$(".MC3").click(function() {
		if ($(this).attr('answered')!=1){
			var que_idx=$(this).attr('que_index');
			var ans_idx=$(this).attr('ans_index');
			var answer=ans_idx;
			$('.MC3[que_index="'+que_idx+'"]').removeClass('MC3_select');
			$(this).addClass('MC3_select');
			var ret=save_answer(que_idx,ans_idx,answer,-2,1);
			if (ret){
				show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
			}
		}
	});
	$(".MMC3").click(function() {
		if ($(this).attr('answered')!=1){
			var que_idx=$(this).attr('que_index');
			var ans_idx=$(this).attr('ans_index');
			var answer=ans_idx;
			if ($(this).hasClass('MMC3_select')){
				$(this).removeClass('MMC3_select');
				$(this).css('border-color','transparent');
				answer=0;
			}else{
				$(this).addClass('MMC3_select');
				$(this).css('border-color','blue');
				answer=1;
			}
			var ret=save_answer(que_idx,ans_idx,answer,-2,1);
			if (ret){
				show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
			}
		}
	});
	//$("input[type='checkbox']").click(function() {
	//	var que_idx=$(this).attr('que_index');
	//	var ans_idx=$(this).attr('ans_index');
	//	var answer=0;
	//	if ($(this).attr('checked')){
	//		answer=1;
	//	}
		//var ret=save_answer(que_idx,ans_idx,answer,-2,1);
		//	show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
	//});

	$("input[type='text'],input[type='number'],select,textarea").change(function() {
		var que_idx=$(this).attr('que_index');
		var ans_idx=$(this).attr('ans_index');
		var answer=$.trim($(this).val());
		var ret=save_answer(que_idx,ans_idx,answer,-2,1);
		if (ret){
			show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
		}
	});


	$('.upload_answer').change(function() {
		var que_idx=$(this).attr('que_index');
		var ans_idx=$(this).attr('ans_index');
		id="file_"+que_idx+"_"+ans_idx;
		width=$('#'+id).parent().width()-20;
		height=$('#'+id).parent().height();
		if (auto_submit){
			upload_answer("file_upload_done", id, 5120, que_idx, ans_idx, width, height);
		}
	});

	if ($.browser && !($.browser.msie && $.browser.version<=8)){
		$('.fix_input_box_position').each(function(j, obj) {
			$qi=$(obj).attr('que_index');
			$ai=$(obj).attr('ans_index');
			$obj_top=$(obj).offset().top;
			$obj_left=$(obj).offset().left;
			$ipt_obj_top=$('.input_answer[que_index="'+$qi+'"][ans_index="'+$ai+'"]').offset().top;
			$ipt_obj_left=$('.input_answer[que_index="'+$qi+'"][ans_index="'+$ai+'"]').offset().left;
			$ipt_obj_height=$('.input_answer[que_index="'+$qi+'"][ans_index="'+$ai+'"]').height();
			sp=3;
			if ($ipt_obj_height>setting_line_height){
				sp=($ipt_obj_height-setting_line_height)/2;
			}

			if ($.browser.msie && $.browser.version<9){
				sp=sp+24;
			}

			//if ($.browser.mozilla || ($.browser.msie && $.browser.version<9)){
			//	sp=sp+24;
			//}
			corr_obj=$('.correct_box[que_index="'+$qi+'"][ans_index="'+$ai+'"]');
			if ($(corr_obj).length>0){
				$corr_obj_top=$(corr_obj).offset().top;
				$corr_obj_left=$(corr_obj).offset().left;
				$corr_obj_top=$corr_obj_top+($obj_top-$ipt_obj_top);
				$corr_obj_left=$corr_obj_left+($obj_left-$ipt_obj_left);
				$main_obj_top=parseInt($('.correct_box[que_index="'+$qi+'"][ans_index="'+$ai+'"]').parents('.main_object').css('top'));
				$main_obj_left=parseInt($('.correct_box[que_index="'+$qi+'"][ans_index="'+$ai+'"]').parents('.main_object').css('left'));
				$('.input_answer[que_index="'+$qi+'"][ans_index="'+$ai+'"]').css({ 'position':'absolute','top': ($obj_top-$main_obj_top-sp)+'px', 'left': ($obj_left-$main_obj_left)+'px' });
				$('.correct_box[que_index="'+$qi+'"][ans_index="'+$ai+'"]').css({ 'position':'absolute','top': ($corr_obj_top-$main_obj_top-sp)+'px', 'left': ($corr_obj_left-$main_obj_left)+'px' });
				//$('.input_answer[que_index="'+$qi+'"][ans_index="'+$ai+'"]').offset({ top: ($obj_top-sp)+unit, left: $obj_left });
				//$('.correct_box[que_index="'+$qi+'"][ans_index="'+$ai+'"]').offset({ top: ($corr_obj_top-sp)+unit, left: $corr_obj_left });
			}
		});
	}
	
	//for fix android drag and drop problem
	$agent=navigator.userAgent.toLowerCase();
	if(isInIframe && ($agent.match(/android/i)) || ($agent.match(/transformer/)) ) {
		$('body').bind("touchend", function(){}, false);
	}
});


function initEngine(){
	if (setting_background_image!='' && setting_background_image!='none'){setting_background_image2='url('+setting_background_image+')';}else{setting_background_image2='none'}
	$('body').css({"font-size": setting_font_size+"pt",'font-family':setting_font_family, "line-height": setting_line_height+"pt", "background-image" : setting_background_image2, "background-repeat" : setting_background_repeat});
	$('.input_answer').css({'font-size':setting_font_size+'pt'});
	$('.question[hide=1]').html('&#160;');
	$('div[type="SOUND"],div[type="VIDEO"],div[type="SUBMIT"]').parent().css('z-index','102');
	$('#page_control').hide();
	$('.matching').css('font-size',(setting_font_size-5)+'pt');
	if (isInIframe){
		if (profile!=2){
			$('[teacher_version="1"]').hide();
		}
		if (typeof(parent.$room_id) == 'undefined' || parent.$room_id == null || parent.$room_id==''){
			$('div[type="REPORT"]').html('');
		}

	}else if (!isInIframe) {
		$('div[type="REPORT"]').html('');
	}

	submit_button='<button class="submit_answer">提交</button>';
	submit_page_button='<button class="submit_page">提交</button>';
	if (setting_submit_button_image){
		submit_button='<a href="#" class="submit_answer"><img src="'+setting_submit_button_image+'" border="0"/></a>';
		submit_page_button='<a href="#" class="submit_page"><img src="'+setting_submit_button_image+'" border="0"/></a>';
	}
	if (!auto_submit){
		if ($('.submit').length>0){
			$('.submit').show();
			$('.button_box').hide();
		}else{
			$('.button_box').show();
		}
	}


		$('.submit').html(
			$(submit_page_button).click(function(){
				$(this).hide();
				//$('.submit_answer').each(function(j, obj) {
				//	$(obj).click();
				//})
				$('.submit_answer').trigger( "click" );

				//meic_post_data_to_app();
				if(fun_meic_submited){
					meic_submited();
				}
				return false;
			})
		);

		$('.button_box').html(

		$(submit_button).click(function(){
			button_obj=$(this);
			parent_obj=$(this).parent();

			var que_type=$(parent_obj).attr('que_type');
			var que_style=$(parent_obj).attr('que_style');
			var que_index=$(parent_obj).attr('que_index');
			if (fun_meic_before_answer){
				meic_before_answer(que_index);
			}
				if ((que_type=='MC' || que_type=='MMC') && que_style==3){
					var answered=false;
					meic_reset_answer(que_index);
					$('.question_div[que_index="'+que_index+'"]').find('.'+que_type+'3_select').each(function(j, obj) {
						answered=true;
						var que_idx=$(obj).attr('que_index');
						var ans_idx=$(obj).attr('ans_index');
						var answer=ans_idx;
						//is_right=$('.correct_box[que_index="'+que_idx+'"]').find('.correct_icon').attr("is_right");
						//if (is_right!=1){
							if (que_type=='MMC'){
								answer=1
							}
							var ret=meic_set_answer(que_idx,ans_idx,answer,-2,1);
							show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
							if (fun_meic_after_answer){
								meic_after_answer(ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer);
							}
						//}
					});
					if (!answered){
						var ret=meic_set_answer(que_index,0,'0',0,1);
						show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
						if (fun_meic_after_answer){
							meic_after_answer(que_idx,0,0,ret.answer,ret.corr_answer);
						}
					}
				}else if (que_type=='MC' || que_type=='MMC'){
					var answered=false;
					meic_reset_answer(que_index);
					$('.question_div[que_index="'+que_index+'"]').find('.input_answer:checked').each(function(j, obj) {
						answered=true;
						var que_idx=$(obj).attr('que_index');
						var ans_idx=$(obj).attr('ans_index');
						var answer=$.trim($(obj).val());
						//is_right=$('.correct_box[que_index="'+que_idx+'"]').find('.correct_icon').attr("is_right");
						//if (is_right!=1){
							if (que_type=='MMC'){
								answer=1;
							}
							var ret=meic_set_answer(que_idx,ans_idx,answer,-2,1);
							show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
							if (fun_meic_after_answer){
								meic_after_answer(ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer);
							}
						//}
					});


					if (!answered){
						var ret=meic_set_answer(que_index,0,'0',0,1);
						show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
						if (fun_meic_after_answer){
							meic_after_answer(que_idx,0,0,ret.answer,ret.corr_answer);
						}
					}
				}else if (que_type=='FIB'){
					meic_reset_answer(que_index);
					$('.question_div[que_index="'+que_index+'"]').find('.input_answer').each(function(j, obj) {

						var que_idx=$(obj).attr('que_index');
						var ans_idx=$(obj).attr('ans_index');
						var answer;


						//is_right=$('.correct_box[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').find('.correct_icon').attr("is_right");
						//if (is_right!=1){
							if (que_style==3){
								var droped_ans_idx=$(obj).attr('droped_ans_idx');
								var droped_que_idx=$(obj).attr('droped_que_idx');
								if (droped_ans_idx){
									answer=get_FIB3_answer(droped_que_idx,droped_ans_idx);
								}
							}else if (que_style==6){
								answer=get_FIB6_answer(que_idx,ans_idx);
							}else if (que_style==7 || que_style==8){
								answer=get_FIB7_answer(que_idx,ans_idx);
							}else if (que_style==9 || que_style==10){
								answer=$.trim($(obj).html());
								//$(obj).attr('ans_index',(j+1));
								//$('.correct_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').attr('ans_index',(j+1));
								ans_idx=j+1;
							}else{
								answer=$.trim($(obj).val());
							}
							if (answer==null || answer==''){answer=' ';}
							var ret=meic_set_answer(que_idx,ans_idx,answer,-2,1);
							show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
							if (fun_meic_after_answer){
								meic_after_answer(ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer);
							}
						//}
					});
				}else if (que_type=='LQ'){
					$('.question_div[que_index="'+que_index+'"]').find('.input_answer').each(function(j, obj) {
						var que_idx=$(obj).attr('que_index');
						var ans_idx=$(obj).attr('ans_index');
						var answer=$(obj).val();

						is_right=$('.correct_box[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').find('.correct_icon').attr("is_right");
						if (typeof is_right == 'undefined'){
							var ret=meic_set_answer(que_idx,ans_idx,answer,-2,1);
							var file_upload_tmp=false;
							if (que_style==2){
								file_upload_tmp=true;
								id="file_"+que_idx+"_"+ans_idx;
								width=$('#'+id).parent().width()-20;
								height=$('#'+id).parent().height();
								upload_answer("file_upload_done", id, 5120, que_idx, ans_idx, width, height);
								$('<img src="/apps/meic/engine/img/icon_saving_s.gif" style="margin-left:10px;vertical-align:bottom;" class="icon_saving"/>').fadeIn(1000).insertAfter($('#'+id));

							}
							show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
							if (fun_meic_after_answer){
								meic_after_answer(ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer);
							}
							if (!file_upload_tmp){
								$('<img src="/apps/meic/engine/img/icon_saving_s.gif" style="margin-left:10px;vertical-align:bottom;" class="icon_saving"/>').fadeIn(1000).delay(1000).fadeOut(1000).insertAfter($(button_obj));
							}
						}
					});
				}

				//remove localStorage answer
				if (auto_save && !auto_submit && hasStorage){
					at=localStorage.getItem(storage_tmp_name);
					if (at!=null){
						at=JSON.parse(at);
						nat=[];
						$.each(at, function(i, obj) {
							if (obj.que_idx!=que_index){
								nat.push(obj);
							}
						});
						localStorage.setItem(storage_tmp_name, JSON.stringify(nat));
					}
				}


				if(fun_meic_submited){
					meic_submited(que_index);
				}
				if ($('.submit').length==0){
					//meic_post_data_to_app();
				}

				//check redo and hidden submit button when submit answer
				if (!auto_submit){
					if ($('.submit').length>0){
						if ($('.input_answer[redo="1"]').length==0){
							$('.submit_page').hide();
						}
					}else{
						obj=$('.question_div[que_index="'+que_index+'"]');
						if ($(obj).find('.input_answer[redo="1"]').length==0){
							$(obj).find('.button_box').hide();
						}
					}
				}
				return false;
		})
		);

		if ($('.submit').length>0){$('.button_box').hide()};
	//if (user_type==3){
		if (auto_save && !auto_submit && hasStorage){
		//localStorage.removeItem(storage_tmp_name);
			at=localStorage.getItem(storage_tmp_name);
			if (at!=null){
				at=JSON.parse(at);
				resume_result(at);
			}

		}

		ans_data=meic_get_answer_JSON();
		//alert(JSON.stringify(ans_data));
		resume_result(ans_data);
	//}

	//check redo and hidden submit button when page load
	if (!auto_submit){
		if ($('.submit').length>0){
			if ($('.input_answer[answered="1"]').length>0 && $('.input_answer[redo="1"]').length==0){
				$('.submit_page').hide();
			}
		}else{
			$('.question_div').each(function(index,obj){
				if ($(obj).find('.input_answer[answered="1"]').length>0 && $(obj).find('.input_answer[redo="1"]').length==0){
					$(obj).find('.button_box').hide();
				}
			});
		}
	}else{
		$('.submit_page').hide();
		$('.button_box').hide();
	}

}


function matching1(obj){
	$( ".matching1" ).removeClass('matching_active');
	$(obj).addClass('matching_active');
	matching1_active_obj=$(obj);
	if (matching2_active_obj){
		var que_idx=$(matching1_active_obj).attr('que_index');
		var ans_idx=$(matching1_active_obj).attr('ans_index');
		match_to(matching1_active_obj,matching2_active_obj,true,false);
		var answer=get_FIB7_answer(que_idx,ans_idx);
		var ret=save_answer(que_idx,ans_idx,answer,-2,1);
		if (ret){
			show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
		}
	}
}

function matching2(obj){
	$( ".matching2" ).removeClass('matching_active');
	$(obj).addClass('matching_active');
	matching2_active_obj=$(obj);
	if (matching1_active_obj){
		var que_idx=$(matching1_active_obj).attr('que_index');
		var ans_idx=$(matching1_active_obj).attr('ans_index');
		match_to(matching1_active_obj,matching2_active_obj,true,false);
		var answer=get_FIB7_answer(que_idx,ans_idx);
		var ret=save_answer(que_idx,ans_idx,answer,-2,1);
		if (ret){
			show_result(ret.result,ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer,ret.times,true);
		}

	}
}

function match_to(matching1_obj,matching2_obj,save,show_answer){
	m1_que_index=$(matching1_obj).attr('que_index');
	m1_ans_index=$(matching1_obj).attr('ans_index');
	m2_que_index=$(matching2_obj).attr('que_index');
	m2_ans_index=$(matching2_obj).attr('ans_index');

	var corr_obj=$(".correct_answer[que_index='"+m1_que_index+"'][ans_index='"+m1_ans_index+"']");
	if (!show_answer){
		$(matching1_obj).removeClass('matching_active');
		$(matching2_obj).removeClass('matching_active');
	}

	if (!$(matching2_obj).attr('matched_que_idx') && !$(corr_obj).text() || show_answer){
		var x1=$(matching1_obj).offset().left + ($(matching1_obj).width() / 2);
		var y1=$(matching1_obj).offset().top + ($(matching1_obj).height() / 2);
		var x2=$(matching2_obj).offset().left + ($(matching2_obj).width() / 2);
		var y2=$(matching2_obj).offset().top + ($(matching2_obj).height() / 2);
		multiple_match=$(matching1_obj).attr('multiple_match');
		line_id=m1_que_index+'_'+m1_ans_index+'_'+m2_que_index+'_'+m2_ans_index;
		if (!show_answer){
			if ((multiple_match==0 && !$(matching1_obj).attr('matched_que_idx')) || multiple_match==1){
				$('.matching_line[matching1_que_idx="'+m1_que_index+'"][matching1_ans_idx="'+m1_ans_index+'"][matching2_que_idx="'+m2_que_index+'"][matching2_ans_idx="'+m2_ans_index+'"]').remove();
			}else{
				$('.matching1[matched_que_idx="'+m1_que_index+'"]').removeAttr('matched_que_idx').removeAttr('matched_ans_idx');
				$('.matching2[matched_que_idx="'+m1_que_index+'"]').removeAttr('matched_que_idx').removeAttr('matched_ans_idx');
				$('.matching_line[matching1_que_idx="'+m1_que_index+'"]').remove();
			}
		}
		meic_drawline(x1,y1,x2,y2,m1_que_index,m1_ans_index,m2_que_index,m2_ans_index,show_answer);
	if (!show_answer){

		$(matching1_obj).attr('matched_que_idx',m2_que_index);
		$(matching1_obj).attr('matched_ans_idx',m2_ans_index);
		$(matching2_obj).attr('matched_que_idx',m1_que_index);
		$(matching2_obj).attr('matched_ans_idx',m1_ans_index);
	}
		matching1_active_obj=null;
		matching2_active_obj=null;
		if (save){
			answer=get_FIB7_answer(m1_que_index,m1_ans_index);
			//var result=save_answer(m1_que_index,m1_ans_index,answer,-2,1);
			//return result;
		}
	}
}

function drop_to(drag_obj,drop_obj,save){
	var clone_drag=$(drag_obj).attr('clone_drag');
	var drag_que_idx=$(drag_obj).attr('que_index');
	var que_idx=$(drop_obj).attr('que_index');
	var ans_idx=$(drop_obj).attr('ans_index');
	var que_style=$(drop_obj).attr('que_style');
	var drop_position=$(drop_obj).attr('drop_position') || 'collinear';
	//redo=$('.button_box[que_index="'+que_idx+'"]').attr("redo");
	redo=$('.input_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').attr('redo');

	var corr_obj=$(".correct_answer[que_index='"+que_idx+"'][ans_index='"+ans_idx+"']");
	if (!$(corr_obj).text() || (typeof redo != 'undefined' && redo)){
	//if (drag_que_idx==que_idx){
		this_top=($(drop_obj).offset().top+2);
		this_left=($(drop_obj).offset().left+2);
		this_left2=this_left;
		draged_width=0;
		//tmp_max_top=0;
		//max_top=0;
		$(drag_obj).draggable( "option", "revert", false );

		if (drop_position=='collinear' && que_style==6){
			var drop_obj_width=$(drop_obj).width();
			$('.drag[droped_que_idx="'+que_idx+'"][droped_ans_idx="'+ans_idx+'"]').each(function(k, obj3) {
				var padding= parseInt($(obj3).css('padding')) || 0;
				padding=padding*2;
				draged_width+=$(obj3).width()+padding;
				this_left+=$(obj3).width()+padding;
				//draged_width+=$(obj3).width()+5;
				//this_left+=$(obj3).width()+5;
				//max_top=Math.max(max_top,$(obj3).offset.top);
				if (draged_width+$(drag_obj).width() + padding >drop_obj_width ){
					this_top+=$(obj3).height() + padding;
					this_left=this_left2;
					draged_width=0;
				}
				//tmp_max_top=$(obj3).offset.top;
			});
		}

		clone_drag_obj=null;
		if (clone_drag==1){
			clone_drag_obj=$(drag_obj).clone();
			$(clone_drag_obj).appendTo('body').offset({ top: this_top, left: this_left });
				$(clone_drag_obj).attr('droped_ans_idx',ans_idx);
				$(clone_drag_obj).attr('droped_que_idx',que_idx);
				$(clone_drag_obj).removeClass('drag_active');
			$(clone_drag_obj).draggable({
				snap: ".drop", snapMode: "inner",
				stop: function( event, ui ) {
//					if ($(this).attr('droped_ans_idx')==''){
						$(drop_obj).attr('droped_ans_idx','');
						$(drop_obj).attr('droped_que_idx','');
						$(drag_obj).attr('droped_ans_idx','');
						$(drag_obj).attr('droped_que_idx','');
						$(this).remove();
//					}
				}
			});
		}else{
			$(drag_obj).offset({ top: this_top, left: this_left });
			$(drag_obj).attr('droped_ans_idx',ans_idx);
			$(drag_obj).attr('droped_que_idx',que_idx);
		}

		draged_ans_idx=$(drag_obj).attr('ans_index');
		draged_que_idx=$(drag_obj).attr('que_index');

		$(drop_obj).attr('droped_ans_idx',draged_ans_idx);
		$(drop_obj).attr('droped_que_idx',draged_que_idx);

		$(drag_obj).removeClass('drag_active');
		drag_active_obj=null;
		if (save){
			if (que_style==3){
				answer=get_FIB3_answer(draged_que_idx,draged_ans_idx);
			}else if (que_style==6){
				answer=get_FIB6_answer(que_idx,ans_idx);
			}
			var result=save_answer(que_idx,ans_idx,answer,-2,1);
			return result;
		}
	//}
	}
}

function get_FIB3_answer(que_idx,ans_idx){
	hsrc=$('.drag[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"] > .answer').html();
// for offline ie brower auto convert html tag to upper case problem
//	if (hsrc.indexOf('<')>=0 && hsrc.indexOf('>')>0){hsrc=hsrc.toLowerCase()}
	var answer_src=$(hsrc).attr('src');
	if (answer_src){
			answer_src=meic_check_path(answer_src);
			answer_width=$(hsrc).attr('width');
			answer_height=$(hsrc).attr('height');
			if (answer_width && answer_height){
				hsrc='<img src="'+answer_src+'" width="'+answer_width+'" height="'+answer_height+'">';
			}else{
				hsrc='<img src="'+answer_src+'">';
			}
	}

	return $.trim(hsrc);
}

function get_FIB6_answer(que_idx,ans_idx){
	var answer_ary=new Array();
	$('.drag[droped_que_idx="'+que_idx+'"][droped_ans_idx="'+ans_idx+'"]').each(function(k, obj3) {
		hsrc=$(obj3).find('.answer').html();
		var answer_src=$(hsrc).attr('src');
		if (answer_src){
			answer_src=meic_check_path(answer_src);
			answer_width=$(hsrc).attr('width');
			answer_height=$(hsrc).attr('height');
			if (answer_width && answer_height){
				hsrc='<img src="'+answer_src+'" width="'+answer_width+'" height="'+answer_height+'">';
			}else{
				hsrc='<img src="'+answer_src+'">';
			}
		}
		answer_ary.push(hsrc);
	})
	answer_ary.sort();
	return $.trim(answer_ary.toString());
}
function get_FIB7_answer(que_idx,ans_idx){
	var answer_ary=new Array();
	$('.matching2[matched_que_idx="'+que_idx+'"][matched_ans_idx="'+ans_idx+'"]').each(function(k, obj3) {
		hsrc=$(obj3).next().html();
		var answer_src=$(hsrc).attr('src');
		if (answer_src){
			answer_src=meic_check_path(answer_src);
			answer_width=$(hsrc).attr('width');
			answer_height=$(hsrc).attr('height');
			if (answer_width && answer_height){
				hsrc='<img src="'+answer_src+'" width="'+answer_width+'" height="'+answer_height+'">';
			}else{
				hsrc='<img src="'+answer_src+'">';
			}
		}
		answer_ary.push(hsrc);
	})
	answer_ary.sort();
	return $.trim(answer_ary.join(';;'));
}
function resume_result(ans_data){
	if (profile!=2 || !isInIframe){
	$.each(ans_data, function(i, obj) {
		var que_idx=obj.que_idx;
		var ans_idx=obj.ans_idx;
		var answer=obj.answer;
		var corr_answer=obj.corr_answer;
		var result=obj.result;
		var is_right=obj.is_right;
		var times=obj.times;
		var tpath=obj.thumbnail;
		var fpath=obj.path;
		var que_type=$('.input_answer[que_index="'+que_idx+'"]').attr('que_type');
		var que_style=$('.input_answer[que_index="'+que_idx+'"]').attr('que_style');

		if ((que_type=='MC' || que_type=='MMC') && que_style==3){
			input_obj=$("."+que_type+"3[que_index='"+que_idx+"'][ans_index='"+answer+"']");
			corr_obj=$(".correct_answer[que_index='"+que_idx+"']");
			$(input_obj).addClass(que_type+'3_select');
		}else if (que_type=='MC' || que_type=='MMC'){
			input_obj=$("input[que_index='"+que_idx+"'][ans_index='"+answer+"']");
			corr_obj=$(".correct_answer[que_index='"+que_idx+"']");
			$(input_obj).attr('checked',true);
		}else if ((que_style=='9' || que_style=='10') && que_type=='FIB'){
			//$(".input_answer[que_index='"+que_idx+"']:eq("+fib9_idx+")").html(answer);
			//$(".input_answer[que_index='"+que_idx+"']:eq("+fib9_idx+")").attr('ans_index',(fib9_idx+1));
			//$(".correct_answer[que_index='"+que_idx+"']:eq("+fib9_idx+")").attr('ans_index',(fib9_idx+1));
			$(".input_answer[que_index='"+que_idx+"']:eq("+(ans_idx-1)+")").html(answer);
			$(".input_answer[que_index='"+que_idx+"']:eq("+(ans_idx-1)+")").attr('ans_index',(ans_idx));
			$(".correct_answer[que_index='"+que_idx+"']:eq("+(ans_idx-1)+")").attr('ans_index',(ans_idx));
		}else{
			input_obj=$(".input_answer[que_index='"+que_idx+"'][ans_index='"+ans_idx+"']");
			corr_obj=$(".correct_answer[que_index='"+que_idx+"'][ans_index='"+ans_idx+"']");
			if ($(input_obj).attr('que_style')=='3' && $(input_obj).attr('que_type')=='FIB' && answer!=null && answer!=''  && answer!=' '){
				var answer_src=$(answer).attr('src');
				if (answer_src){
					drag_obj=$(".drag > .answer > img[src='"+meic_check_path(answer_src)+"']").parents('.drag');
				}else{
					//drag_obj=$(".drag > .answer:contains('"+answer+"')").parents('.drag');
					drag_obj=$(".drag > .answer").filter(function() {return $(this).html() == answer;}).parents(".drag:not([droped_que_idx])").first();
				}
				drop_to(drag_obj,input_obj,false);
			}else if ($(input_obj).attr('que_style')=='6' && $(input_obj).attr('que_type')=='FIB' && answer!=null && answer!='' && answer!=' '){
				$answer_ary=answer.split(',');

				$.each($answer_ary, function(index, value) {
					var answer_src=$(value).attr('src');
					if (answer_src){
						drag_obj=$(".drag > .answer > img[src='"+meic_check_path(answer_src)+"']").parents('.drag');
					}else{
						//drag_obj=$(".drag > .answer:contains('"+value+"')").parents('.drag');
						drag_obj=$(".drag > .answer").filter(function() {return $(this).html() == value;}).parents(".drag:not([droped_que_idx])").first();
					}
					if ($(drag_obj).length>1){
						drag_obj=$(drag_obj)[0];
					}
					drop_to(drag_obj,input_obj,false);
				});
			}else if (($(input_obj).attr('que_style')=='7' || $(input_obj).attr('que_style')=='8') && $(input_obj).attr('que_type')=='FIB' && answer!=null && answer!='' && answer!=' '){

				$answer_ary=answer.split(';;');
				$.each($answer_ary, function(index, value) {
					var answer_src=$(value).attr('src');
					if (answer_src){
						matching2_obj=$(".answer > img[src='"+meic_check_path(answer_src)+"']").parent().prev();
					}else{
						//matching2_obj=$(".answer:contains('"+value+"')").prev();
						matching2_obj=$(".answer").filter(function() {return $(this).html() == value;}).prev();
					}
					//alert($(matching2_obj).html());
					match_to(input_obj,matching2_obj,false,false);
				});
			}else{
				$(input_obj).val(answer);
			}
		}
		if (fpath){
			var ua_obj=$('.uploaded_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]');
			//$(ua_obj).html('<a href="'+fpath+'"><img src="'+tpath+'" border="0"/></a>');
			$(ua_obj).html('<img src="'+tpath+'" border="0"/>');
		}
		show_result(result,que_idx,ans_idx,is_right,answer,corr_answer,times,true);

		if (result!=0){
			if(fun_meic_show_result){
				meic_show_result(que_idx,ans_idx,is_right,answer,corr_answer);
			}

			if (fun_meic_answered){
				meic_answered(que_idx,ans_idx,answer);
			}
		}

	});
	}
}

function show_result(result,que_idx,ans_idx,is_right,answer,corr_answer,times,read_only){
	times=parseInt(times);
	var room_close=false;
	var show_correct_answer=1;
	if (typeof setting_show_correct_answer != 'undefined'){
		show_correct_answer=setting_show_correct_answer;
	}
	if (isInIframe && top.$rr_status<=0){
		room_close=true;
	}
	//alert(room_close);
	//if (room_close){result==1;}
	//$('.submit_page').removeAttr('redo');
	//$('.button_box[que_index="'+que_idx+'"]').removeAttr('redo');
	//if (result!=0 || room_close){
	if (result==0){read_only=false;}
	if (1==1){
		//alert(result);
		//if (!room_close && result!=1){
			result = setting_real_time_show_correct;
		//}else{
		//	result = 1;
		//}

		var que_type=$('.input_answer[que_index="'+que_idx+'"]').attr('que_type');
		var que_style=$('.input_answer[que_index="'+que_idx+'"]').attr('que_style');
		if (que_type=='MC' || que_type=='MMC'){
			$('.input_answer[que_index="'+que_idx+'"][ans_index="1"]').attr('answered',1);
		}else{
			$('.input_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').attr('answered',1);
		}

		//check redo
		if (typeof setting_redo_times != 'undefined' && setting_redo_times!=0  && (is_right==0 || is_right==-1 || is_right==null) && ((times < setting_redo_times || setting_redo_times<0) || (is_right==1 && setting_redo_times<0)) && !room_close){
			read_only=false;
			show_correct_answer=0;
			if (!auto_submit){
				if ($('.submit').length>0){
					$('.submit_page').attr('redo',1).show();
				}else{
					$('.button_box[que_index="'+que_idx+'"]').attr('redo',1).show();
				}
			}
			if (que_type=='MC' || que_type=='MMC'){
				$('.input_answer[que_index="'+que_idx+'"][ans_index="1"]').attr('redo',1);
			}else{
				$('.input_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').attr('redo',1);
			}
		}else if (typeof setting_redo_times != 'undefined' && setting_redo_times>0 && times >= setting_redo_times && !(is_right==-1 || is_right==null)){
			read_only=true;
		}
		if (typeof setting_redo_times != 'undefined' && (setting_redo_times>0 && times >= setting_redo_times) || (is_right==1 && setting_redo_times!=-1) || room_close && setting_real_time_show_correct==1){
			$('.button_box[que_index="'+que_idx+'"]').removeAttr('redo');
			if (que_type=='MC' || que_type=='MMC'){
				$('.input_answer[que_index="'+que_idx+'"][ans_index="1"]').removeAttr('redo');
			}else{
				$('.input_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').removeAttr('redo');
			}
		}
		if (profile==2){
			show_correct_answer=1;
			result=1;
		}

		if ((que_type=='MC' && (que_style==1 || que_style==2 || que_style==4))){
			input_obj=$("input[que_index='"+que_idx+"'][ans_index='"+answer+"']");
			corr_obj=$(".correct_answer[que_index='"+que_idx+"']");
			$(".answer[que_index='"+que_idx+"']").css({'background-color':'transparent'});
			if (read_only){
				//$("input[que_index='"+que_idx+"']").attr("disabled", true);
				//$('.button_box[que_index="'+que_idx+'"]').hide();
				$("input[que_index='"+que_idx+"']").attr('disabled','true');
				//$("input[que_index='"+que_idx+"']").click(function(){return false;});
				$('.upload_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').hide();
			}else{
				//$('.button_box[que_index="'+que_idx+'"]').show();
				$("input[que_index='"+que_idx+"']").removeAttr('disabled');
				$('.upload_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').show();
			}
			answer_txt=$(".answer[que_index='"+que_idx+"'][ans_index='"+corr_answer+"']").html();
			if ($(".question_div[que_index='"+que_idx+"']").find('ol').css('list-style-type')!='none'){
				answer_txt=String.fromCharCode((64+parseInt(corr_answer)))+'. '+answer_txt;
			}
			//corr_answer=answer_txt;
			if (show_correct_answer==0){corr_answer='';}
			if (is_right==1){corr_answer='';}
			if (result==1){
				if (profile==2){
					$(".answer[que_index='"+que_idx+"'][ans_index='"+corr_answer+"']").css({'background-color':'#FFB1BD','padding':'3px'});
					$(corr_obj).hide().fadeIn(1000).html('');
				}else{
					$(".answer[que_index='"+que_idx+"'][ans_index='"+corr_answer+"']").css({'background-color':'#FFB1BD','padding':'3px'});
					$(corr_obj).hide().fadeIn(1000).html('<img src="/apps/meic/engine/img/icon'+is_right+'.gif" class="correct_icon" is_right="'+is_right+'">');
				}
			}else if (setting_real_time_show_correct==0){
				$(corr_obj).css('white-space','nowrap').fadeIn(1000).delay(2000).fadeOut(1000).html('已儲存');
				setTimeout(function(){$(".correct_answer[que_index='"+que_idx+"']").html('');},4000);
			}else{
				$(corr_obj).fadeIn(1000).html('');
			}
			$(corr_obj).attr('show_answer',1);
		}else if ((que_type=='MC' || que_type=='MMC')&& que_style==3){
			input_obj=$(".input_answer[que_index='"+que_idx+"'][ans_index='"+answer+"']");
			corr_obj=$(".correct_answer[que_index='"+que_idx+"']");
			$(".answer[que_index='"+que_idx+"']").css({'background-color':'transparent'});

			if (read_only){
				//$("input[que_index='"+que_idx+"']").attr("disabled", true);
				//$('.button_box[que_index="'+que_idx+'"]').hide();
				//$(".input_answer[que_index='"+que_idx+"']").removeClass('MC3');
				//$(".input_answer[que_index='"+que_idx+"']").addClass('MC3_unselect');
				//$(".input_answer[que_index='"+que_idx+"']").click(function(){return false;});
				$(".input_answer[que_index='"+que_idx+"']").attr('answered','1');
				$('.upload_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').hide();
			}else{
				//$('.button_box[que_index="'+que_idx+'"]').show();
				$(".input_answer[que_index='"+que_idx+"']").removeAttr('answered');
				$('.upload_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').show();
			}
			var corr_text='';
			if (is_right!=1 && show_correct_answer==1 && result==1){
				//corr_answer.sort(function(a,b){return a-b});
				if (que_type=='MMC'){
					$.each(corr_answer, function(index, value) {
						//answer_txt=$(".answer[que_index='"+que_idx+"'][ans_index='"+value+"']").html();
						$(".answer[que_index='"+que_idx+"'][ans_index='"+value+"']").css({'background-color':'#FFB1BD','padding':'3px'});
						//if (index>0){corr_text+=', ';}
						//corr_text+=answer_txt;
					});
				}
				if (que_type=='MC'){
					//corr_text+=$(".answer[que_index='"+que_idx+"'][ans_index='"+corr_answer+"']").html();
					$(".answer[que_index='"+que_idx+"'][ans_index='"+corr_answer+"']").css({'background-color':'#FFB1BD','padding':'3px'});

				}
			}
			//if (que_type=='MMC'){
			//	correct_answer_list=$(corr_obj).attr('correct_answer_list');
			//	if (correct_answer_list=='vertical'){
			//		corr_text="<br>"+corr_text.replace(/,/g,"<br>");
			//	}
			//}
			if (profile!=2){
				corr_text='<img src="/apps/meic/engine/img/icon'+is_right+'.gif" class="correct_icon" is_right="'+is_right+'"> '+corr_text;
			}

			if (result==1){
				$(corr_obj).hide().fadeIn(1000).html(corr_text);
			}else if (setting_real_time_show_correct==0){
				$(corr_obj).css('white-space','nowrap').fadeIn(1000).delay(2000).fadeOut(1000).html('已儲存');
				setTimeout(function(){$(".correct_answer[que_index='"+que_idx+"']").html('');},4000);
			}else{
				$(corr_obj).fadeIn(1000).html('');
			}
			$(corr_obj).attr('show_answer',1);
		}else if(que_type=='MMC'){
			input_obj=$(".input_answer[que_index='"+que_idx+"'][ans_index='"+ans_idx+"']");
			corr_obj=$(".correct_answer[que_index='"+que_idx+"']");
			div_obj=$(".question_div[que_index='"+que_idx+"']");
			$(".answer[que_index='"+que_idx+"']").css({'background-color':'transparent'});
			list_style_type=$(div_obj).find('ol').css('list-style-type');

			if (read_only){
				//$("input[que_index='"+que_idx+"']").attr("disabled", true);
				//$('.button_box[que_index="'+que_idx+'"]').hide();
				$("input[que_index='"+que_idx+"']").attr('disabled','true');
				//$("input[que_index='"+que_idx+"']").click(function(){return false;});
				$('.upload_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').hide();
			}else{
				//$('.button_box[que_index="'+que_idx+'"]').show();
				$("input[que_index='"+que_idx+"']").removeAttr('disabled');
				$('.upload_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').show();
			}

			var corr_text='';
			if (is_right!=1 && show_correct_answer==1 && result==1){
				//corr_answer.sort(function(a,b){return a-b});
				$.each(corr_answer, function(index, value) {
					$(".answer[que_index='"+que_idx+"'][ans_index='"+value+"']").css({'background-color':'#FFB1BD','padding':'3px'});
					//answer_txt=$(".answer[que_index='"+que_idx+"'][ans_index='"+value+"']").html();
					//answer_idx_txt=String.fromCharCode((64+parseInt(value)));
					//if (index>0){corr_text+=', ';}
					//if (list_style_type!='none'){
					//	corr_text+=answer_idx_txt+'. ';
					//}
					//corr_text+=answer_txt;
				});
			}

			//correct_answer_list=$(corr_obj).attr('correct_answer_list');
			//if (correct_answer_list=='vertical'){
			//	corr_text="<br>"+corr_text.replace(/,/g,"<br>");
			//}
			if (profile!=2){
				corr_text='<img src="/apps/meic/engine/img/icon'+is_right+'.gif" class="correct_icon" is_right="'+is_right+'"> '+corr_text;
			}
			if (result==1){
				$(corr_obj).hide().fadeIn(1000).html(corr_text);
			}else if (setting_real_time_show_correct==0){
				$(corr_obj).css('white-space','nowrap').fadeIn(1000).delay(2000).fadeOut(1000).html('已儲存');
				setTimeout(function(){$(".correct_answer[que_index='"+que_idx+"']").html('');},4000);
			}else{
				$(corr_obj).fadeIn(1000).html('');
			}
			$(corr_obj).attr('show_answer',1);
		}else{
			input_obj=$(".input_answer[que_index='"+que_idx+"'][ans_index='"+ans_idx+"']");
			corr_obj=$(".correct_answer[que_index='"+que_idx+"'][ans_index='"+ans_idx+"']");
			drag_obj=$(".drag[droped_que_idx='"+que_idx+"']");
			//drag_obj=$(".drag[que_index='"+que_idx+"']");
			redo=$('.input_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').attr('redo');
			//redo=$('.button_box[que_index="'+que_idx+'"]').attr("redo");
			if (read_only && (typeof redo == 'undefined' ||  !redo)){
				var clone_drag=$(drag_obj).attr('clone_drag') || '';
				//if (clone_drag=="1"){
					$('.drag[droped_que_idx="'+que_idx+'"][droped_ans_idx="'+ans_idx+'"]').draggable( "option", "disabled", true );
				//}else {
				//	$(drag_obj).draggable( "option", "disabled", true );
				//}
				if (sortable_obj_count>0){
					$('.answer_sort[que_index="'+que_idx+'"],.answer_sort2[que_index="'+que_idx+'"]').sortable('disable');
				}
				$(input_obj).attr("disabled", true);
				$(input_obj).attr("readonly", true);
				//$('.button_box[que_index="'+que_idx+'"]').hide();
				$('.upload_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').hide();

			}else{
				$(drag_obj).draggable( "option", "disabled", false );
				if (sortable_obj_count>0){
					$('.answer_sort[que_index="'+que_idx+'"],.answer_sort2[que_index="'+que_idx+'"]').sortable('enable');
				}
				$(input_obj).removeAttr("disabled");
				$(input_obj).removeAttr("readonly");
				$('.upload_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]').show();

			}
			//if (answer==null){
			//	$(corr_obj).html('');
			//}else{
				if(que_type=='LQ'){
					if (show_correct_answer==0){corr_answer='';}
					if (result==1){
						$(corr_obj).hide().fadeIn(1000).html(corr_answer);
					}else if (setting_real_time_show_correct==0){
						$(corr_obj).css('white-space','nowrap').fadeIn(1000).delay(2000).fadeOut(1000).html('已儲存');
						setTimeout(function(){$(".correct_answer[que_index='"+que_idx+"'][ans_index='"+ans_idx+"']").html('');},4000);
					}else{
						$(corr_obj).fadeIn(1000).html('');
					}
					$(corr_obj).attr('show_answer',1);
				}else if (que_type=='FIB' && (que_style==7 || que_style==8)){
					$('.matching_right_line[matching1_que_idx="'+que_idx+'"]').remove();
					if (is_right!=1 && show_correct_answer==1){
						corr_answer_ary=corr_answer.split(";;");
						$.each(corr_answer_ary, function(index, value) {
							var answer_src=$(value).attr('src');
							if (answer_src){
								matching2_obj=$(".answer > img[src='"+meic_check_path(answer_src)+"']").parent().prev();
							}else{
								//matching2_obj=$(".answer:contains('"+value+"')").prev();
								matching2_obj=$(".answer").filter(function() {return $(this).html() == value;}).prev();
							}
							match_to(input_obj,matching2_obj,false,true);
						});
					//}else{
					//	$('.matching_right_line').remove();
					}
					if (result==1){
						if (profile!=2){
							$(corr_obj).hide().fadeIn(1000).html('<img src="/apps/meic/engine/img/icon'+is_right+'.gif" class="correct_icon" is_right="'+is_right+'" align="top">');
						}
					}else if (setting_real_time_show_correct==0){
						$(corr_obj).css('white-space','nowrap').fadeIn(1000).delay(2000).fadeOut(1000).html('已儲存');
						setTimeout(function(){$(".correct_answer[que_index='"+que_idx+"'][ans_index='"+ans_idx+"']").html('');},4000);
					}else{
						$(corr_obj).fadeIn(1000).html('');
					}
					$(corr_obj).attr('show_answer',1);
				}else{
					if (corr_answer!=null){
						corr_answer_ary=corr_answer.split(";");
						corr_answer=corr_answer_ary[0];
					}
					if (show_correct_answer==0){corr_answer='';}
					if (is_right==1){corr_answer='';}
					if (que_type=='FIB' && (que_style==6)){
						correct_answer_list=$(corr_obj).attr('correct_answer_list');
						if (correct_answer_list=='vertical'){
							corr_answer="<br>"+corr_answer.replace(/,/g,"<br>");
						}

					}

					if (result==1){
						if (profile==2){
							$(corr_obj).hide().fadeIn(1000).html(corr_answer);
						}else{
							$(corr_obj).hide().fadeIn(1000).html('<img src="/apps/meic/engine/img/icon'+is_right+'.gif" class="correct_icon" is_right="'+is_right+'" align="top"> '+corr_answer);
						}
					}else if (setting_real_time_show_correct==0){
						$(corr_obj).css('white-space','nowrap').fadeIn(1000).delay(2000).fadeOut(1000).html('已儲存');
						setTimeout(function(){$(".correct_answer[que_index='"+que_idx+"'][ans_index='"+ans_idx+"']").html('');},4000);
					}else{
						$(corr_obj).fadeIn(1000).html('');
					}
					$(corr_obj).attr('show_answer',1);
				}
			//}
		}
	}
}

function save_answer(que_idx,ans_idx,answer,is_right,mark){
	if (auto_submit && profile==3){
		if (fun_meic_before_answer){
			meic_before_answer(que_index);
		}
		//if (setting_real_time_show_correct==0){
			ret=meic_set_answer(que_idx,ans_idx,answer,is_right,mark);
		//}
		if (fun_meic_after_answer){
			meic_after_answer(ret.que_idx,ret.ans_idx,ret.is_right,ret.answer,ret.corr_answer);
		}
		if (fun_meic_answered){
			meic_answered(que_idx,ans_idx,answer);
		}
		if(fun_meic_submited){
			meic_submited(que_idx);
		}
		return ret;
	}else{

		if (auto_save && !auto_submit && hasStorage){
			at=localStorage.getItem(storage_tmp_name);
			t={"que_idx":que_idx,"ans_idx":ans_idx,"is_right":null,"answer":answer,"times":"0","result":0};
			if (at==null){
				at=[];
				at.push(t);
			}else{
				at=JSON.parse(at);
				nat=[];
				$.each(at, function(i, obj) {
					if (obj.que_idx!=que_idx || obj.ans_idx!=ans_idx){
						nat.push(obj);
					}
				});
				nat.push(t);
				at=nat;
			}
			localStorage.setItem(storage_tmp_name, JSON.stringify(at));
		}

		return null;
	}
}

function upload_answer(callback,obj_id,size,que_idx,ans_idx,width,height){
//post_type=1;
//    if (post_type==1){
    	//window.location.href
//		if (width==null){width=150;}
//		if (height==null){height=150;}
//    	$filepath=$('#'+obj_id).val();
    	//alert($filepath);
//    	if ($filepath){
//			a='http://meic.mers.hk?p='+encodeURIComponent('{"action":"uploadanswerfile","res_id":'+res_id+',"res_idx":'+res_idx+',"filesize":'+size+',"que_idx":'+que_idx+',"ans_idx":'+ans_idx+',"callback":"'+callback+'","width":'+width+',"height":'+height+',"file":"'+$filepath+'"}');
//			alert(a);
		//	callback{
		//		'error' => $error,
		//		'filename' => $filename,
		//		'filesize' => $filesize,
		//		'path' => $path.'/'.$filename,
		//		'thumbnail' => $thumbnail_path.'/'.$filename
		//	}
//			for (var key in ans_data) {
//			  if (ans_data.hasOwnProperty(key) && ans_data[key].que_idx==que_idx && ans_data[key].ans_idx==ans_idx) {
//				ans_data[key].path=$filepath;
//				ans_data[key].thumbnail=$filepath;
//			  }
//			}
//			meic_post_result_to_app(ans_data);
//		}
//	}else{
		meic_file_upload(callback,obj_id,size,que_idx,ans_idx,width,height);
//	}
}

function file_upload_done(obj){
	var que_idx=obj.que_idx;
	var ans_idx=obj.ans_idx;
	var tpath=obj.thumbnail;
	var fpath=obj.path;
	var filename=obj.filename;
	if (filename!=""){
		var ua_obj=$('.uploaded_answer[que_index="'+que_idx+'"][ans_index="'+ans_idx+'"]');
		//$(ua_obj).html('<a href="'+fpath+'"><img src="'+tpath+'" border="0"/></a>');
		$(ua_obj).html('<img src="'+tpath+'" border="0"/>');
	}
	$('.icon_saving').fadeOut(1000).remove();
}

function show_prompt(obj){
	template=$(obj).parents('div[type="PROMPT"]').attr('template');
	obj2=$(obj).parent().next();
	$fs=$(obj).parents('fieldset');
	//if ($(obj2).is(":visible")){			//modified by Bond@201305, remarked and replaced by next line
	$('div[type="PROMPT"]').each(function(idx,o){
		$zidx=$(o).parent().attr('zindex');
		$(o).parent().css('z-index',$zidx);
	});

	if($(obj2).css("display") != 'none'){
		if (template==1){$($fs).css('border-color','transparent')};
		$($fs).css('background-color','inherit');
		$(obj).parent().next().hide();
	}else{
		if (template==1){$($fs).css('border-color','black')};
		$($fs).css('background-color',$($fs).attr('background-color'));
		$($fs).parent().parent().css('z-index',1000);
		$(obj).parent().next().show();
	}
}


function meic_drawline(x1, y1, x2, y2, matching1_que_idx,matching1_ans_idx,matching2_que_idx,matching2_ans_idx,show_answer){
	if (x2 < x1)
	{
		var temp = x1;
		x1 = x2;
		x2 = temp;
		temp = y1;
		y1 = y2;
		y2 = temp;
	}
	var line = document.createElement("div");
	if (!show_answer){
		line.className = "matching_line";
		line.onclick = function(){
			matching1_que_idx=$(this).attr('matching1_que_idx');
			matching1_ans_idx=$(this).attr('matching1_ans_idx');
			var corr_obj=$(".correct_answer[que_index='"+matching1_que_idx+"'][ans_index='"+matching1_ans_idx+"']");
			if (!$(corr_obj).text()){
				$('.matching2[matched_que_idx="'+matching1_que_idx+'"]').removeAttr('matched_que_idx').removeAttr('matched_ans_idx');
				$(this).remove();
			}
		};
		line.setAttribute('matching1_que_idx',matching1_que_idx);
		line.setAttribute('matching1_ans_idx',matching1_ans_idx);
		line.setAttribute('matching2_que_idx',matching2_que_idx);
		line.setAttribute('matching2_ans_idx',matching2_ans_idx);
	}else{
		line.className = "matching_right_line";
	}

	var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
	line.style.width = length + "px";
	line.style.zIndex = 99;

	if ($.browser && $.browser.msie && $.browser.version<10){
		line.style.top = (y2 > y1) ? y1 + "px" : y2 + "px";
		line.style.left = x1 + "px";
		var nCos = (x2-x1)/length;
		var nSin = (y2-y1)/length;
		line.style.filter = "progid:DXImageTransform.Microsoft.Matrix(sizingMethod='auto expand', M11=" + nCos + ", M12=" + -1*nSin + ", M21=" + nSin + ", M22=" + nCos + ")";
	}else{
		var angle = Math.atan((y2-y1)/(x2-x1));
		line.style.top = y1 + 0.5*length*Math.sin(angle) + "px";
		line.style.left = x1 - 0.5*length*(1 - Math.cos(angle)) + "px";
		line.style.MozTransform = line.style.WebkitTransform = line.style.transform = line.style.OTransform= "rotate(" + angle + "rad)";
	}
	//return line;
	$(line).appendTo($('body'));
}
function meic_show_report(){
	var room_id=top.$room_id;
	var curr_status=top.$curr_status;
	top.pop_up_clear();
	top.refresh_resource('result_teacher.php?rr_id='+room_id+'&res_idx='+curr_status,curr_status);
}

function meic_all_question_reset(){
	results=[];
	if ($('.submit').length>0){
		$('.submit').show();
		$('.submit_page').show();
	}else{
		$('.button_box').show();
	}
	
	$(".correct_answer").html('');
	$('.question_div').each(function(k, obj) {
		var que_type=$(obj).attr('type');
		var que_style=$(obj).attr('template');
		var que_idx=$(obj).attr('que_index');
		if ((que_type=='MC' && (que_style==1 || que_style==2 || que_style==4)) || (que_type=='MMC' && (que_style==1 || que_style==2 || que_style==4))){
			$(".answer[que_index='"+que_idx+"']").css({'background-color':'transparent'});
			$(obj).find('.input_answer:checked').each(function(j, obj2) {
				var ans_idx=$(obj2).attr('ans_index');
				meic_reset_answer(que_idx,ans_idx);
			});
			$("input[que_index='"+que_idx+"']").removeAttr('disabled');
			$("input[que_index='"+que_idx+"']").removeAttr('checked');
			$('.upload_answer[que_index="'+que_idx+'"]').show();
		}else if ((que_type=='MC' || que_type=='MMC')&& que_style==3){
			$(".answer[que_index='"+que_idx+"']").css({'background-color':'transparent'});
			$(obj).find('.'+que_type+'3_select').each(function(j, obj2) {
				var ans_idx=$(obj2).attr('ans_index');
				meic_reset_answer(que_idx,ans_idx);
			});
			$(".input_answer[que_index='"+que_idx+"']").removeClass('MC3_select MMC3_select');
			$(".input_answer[que_index='"+que_idx+"']").removeAttr('answered');
			$('.upload_answer[que_index="'+que_idx+'"]').show();
		}else if (que_type=='FIB' && (que_style==3 || que_style==6)){
			$(obj).find('.input_answer').each(function(j, obj2) {
				var ans_idx=$(obj2).attr('ans_index');
				meic_reset_answer(que_idx,ans_idx);
			});
			drag_obj=$(".drag[que_index='"+que_idx+"']");
			drop_obj=$(".drop[que_index='"+que_idx+"']");
			clone_drag=$(drag_obj).attr('clone_drag');
			$(drag_obj).each(function(j, obj) {
				if (clone_drag==1 && $(obj).attr('droped_que_idx')){
					$(obj).remove();
				}else{
					org_top=$(obj).attr('org_top');
					org_left=$(obj).attr('org_left');
					$(obj).offset({ top: org_top, left: org_left });
					$(this).draggable( "option", "revert", true );
				}
			});
			$(drag_obj).draggable( "option", "disabled", false );
			$(drag_obj).removeAttr('droped_ans_idx');
			$(drag_obj).removeAttr('droped_que_idx');
			$(drop_obj).removeAttr('droped_ans_idx');
			$(drop_obj).removeAttr('droped_que_idx');
		}else{
			$(obj).find(".input_answer[que_index='"+que_idx+"']").each(function(j, obj2) {
				var ans_idx=$(obj2).attr('ans_index');
				meic_reset_answer(que_idx,ans_idx);
			});
			input_obj=$(".input_answer[que_index='"+que_idx+"']");
			drag_obj=$(".drag[que_index='"+que_idx+"']");
			$('.matching1').removeAttr('matched_que_idx').removeAttr('matched_ans_idx');
			$('.matching2').removeAttr('matched_que_idx').removeAttr('matched_ans_idx');
			$('.matching_line').remove();
			$('.matching_right_line').remove();
			if (que_type=='FIB' && que_style==4){
				$(input_obj).removeAttr('disabled');
			}else if (que_type=='FIB' && (que_style==9 || que_style==10)){
				if (sortable_obj_count>0){ $('.answer_sort[que_index="'+que_idx+'"],.answer_sort2[que_index="'+que_idx+'"]').sortable( "enable" ); }
			}else{
				$(input_obj).attr("readonly", false);
			}
			$(input_obj).val('');
			$('.upload_answer[que_index="'+que_idx+'"]').show();
		}
	});
	if (auto_save && !auto_submit && hasStorage){
		localStorage.removeItem(storage_tmp_name);
	}
}

function meic_answer_statistics(data){
		var curr_ans_right = new Array();
		var curr_ans_wrong = new Array();
		var curr_ans_ans = new Array();
		var curr_status=parent.$curr_status;
		if(data !== undefined){
			tmp_que_idx=0;
			tmp_user_id=0;
			for(k=0;k<data.length;k++){
				if(data[k].res_idx == curr_status) {
					que_idx=data[k].que_idx;
					ans_idx=data[k].ans_idx;
					que_type=data[k].que_type;
					user_id=data[k].id;
					is_right=data[k].is_right;

					//for MMC filter diuplicate recores
					if (que_type==6 && (tmp_que_idx!=que_idx || tmp_user_id!=user_id)){
						ans_idx=0;
					}
					tmp_que_idx=que_idx;
					tmp_user_id=user_id;
					//

					if (is_right==1){
						if(curr_ans_right[que_idx] == undefined){
							curr_ans_right[que_idx]=new Array();
						}
						if(curr_ans_right[que_idx][ans_idx] == undefined){
							curr_ans_right[que_idx][ans_idx]=0;
						}
						curr_ans_right[que_idx][ans_idx]++;
					}

					if (is_right==0){
						if(curr_ans_wrong[que_idx] == undefined){
							curr_ans_wrong[que_idx]=new Array();
						}
						if(curr_ans_wrong[que_idx][ans_idx] == undefined){
							curr_ans_wrong[que_idx][ans_idx]=0;
						}
						curr_ans_wrong[que_idx][ans_idx]++;

					}

					if (is_right==-1){
						if(curr_ans_ans[que_idx] == undefined){
							curr_ans_ans[que_idx]=new Array();
						}
						if(curr_ans_ans[que_idx][ans_idx] == undefined){
							curr_ans_ans[que_idx][ans_idx]=0;
						}
						curr_ans_ans[que_idx][ans_idx]++;
					}
				}
			}
			$('.correct_answer').each(function(j, obj) {
				que_idx=$(obj).attr('que_index');
				ans_idx=$(obj).attr('ans_index') || 0;
				if(ans_idx == undefined){ans_idx=0;}
				right_txt="";
				wrong_txt="";
				answer_txt="";
				total_answer_count=0;
				if(curr_ans_right[que_idx] !== undefined && curr_ans_right[que_idx][ans_idx] !== undefined){
					$(obj).attr('right_count',curr_ans_right[que_idx][ans_idx]);
					total_answer_count+=curr_ans_right[que_idx][ans_idx];
				}else{
					$(obj).attr('right_count','');
				}
				if(curr_ans_wrong[que_idx] !== undefined && curr_ans_wrong[que_idx][ans_idx] !== undefined){
					$(obj).attr('wrong_count',curr_ans_wrong[que_idx][ans_idx]);
					total_answer_count+=curr_ans_wrong[que_idx][ans_idx];

				}else{
					$(obj).attr('wrong_count','');
				}
				if(curr_ans_ans[que_idx] !== undefined && curr_ans_ans[que_idx][ans_idx] !== undefined){
					$(obj).attr('answer_count',curr_ans_ans[que_idx][ans_idx]);
					total_answer_count+=curr_ans_ans[que_idx][ans_idx];
				}else{
					$(obj).attr('answer_count','');
				}
				right_count=$(obj).attr('right_count');
				wrong_count=$(obj).attr('wrong_count');
				answer_count=$(obj).attr('answer_count');
				if (right_count!='' || wrong_count!=''){
					//right_txt="答對:"+right_count+"/"+total_answer_count+" ";
					if (right_count==''){right_count=0;}
					right_txt='<a href="#" onclick="answered_user('+que_idx+','+ans_idx+',1,this);return false;" style="color:red">答對:'+right_count+'</a> ';
				}
				if (right_count!='' || wrong_count!=''){
					//wrong_txt="答錯:"+wrong_count+"/"+total_answer_count+" ";
					if (wrong_count==''){wrong_count=0;}
					wrong_txt='<a href="#" onclick="answered_user('+que_idx+','+ans_idx+',0,this);return false;" style="color:red">答錯:'+wrong_count+'</a> ';
				}
				if (answer_count!=''){
					answer_txt='<a href="#" onclick="answered_user('+que_idx+','+ans_idx+',-1,this);return false;" style="color:red">已作答:'+answer_count+'</a>';
				}
				var attr = $(obj).attr('show_answer');
				if (typeof attr == 'undefined' || attr == false) {
					$(obj).html(right_txt+wrong_txt+answer_txt);
				}
			});
			if (answered_user_show){
				answered_user();
			}
		}
}

function answered_user(que_idx,ans_idx,is_right,obj){
	var s_top,s_left;
	if (obj){
		s_top=$(obj).offset().top;
		s_left=$(obj).offset().left;
	}
	var tmp_ary=[];
	var mad=top.result_his.member_answer_details;
	answered_user_show=true;
	if (que_idx){
		$('#answered_user').remove();
		html='<div id="answered_user" style="-webkit-border-radius: 3px;-moz-border-radius: 3px;border-radius: 3px;box-shadow:3px 3px 3px rgba(20%,20%,40%,0.5);font-size:16px;color:red;font-family:Arial;padding:5px;border:1px solid red;background-color:white;width:120px;position:absolute;top:'+(s_top+20)+'px;left:'+s_left+'px;line-height:1;z-index:9999">';
		html+='<img src="/apps/meic/img/btn_resize.png" style="float:right" onclick="$(\'#answered_user\').remove();answered_user_show=false;"/>';
		switch(is_right){
		case 1:
			html+='答對學生';
			break;
		case 0:
			html+='答錯學生';
			break;
		default:
			html+='已作答學生';
		}
		html+='<div id="answered_user_list" que_idx="'+que_idx+'" ans_idx="'+ans_idx+'" is_right="'+is_right+'">';
		for (i=0;i<mad.length;i++){
			if (mad[i].res_idx==top.$curr_status &&
				mad[i].que_idx==que_idx &&
				(mad[i].ans_idx==ans_idx || ans_idx==0) &&
				mad[i].is_right==is_right &&
				tmp_ary.indexOf(mad[i].id)==-1){
				tmp_ary.push(mad[i].id);
				html+='<div><a href="/apps/meic/teacher_view_student.php?user_id='+mad[i].id+'&rr_id='+top.$room_id+'&g_id=&res_idx='+top.$curr_status+'&url=" target="_top">'+$('#user_'+mad[i].id+'_detail>.name',parent.document).text()+'</a></div>';
			}
		}
		html+='</div>';
		html+='</div>';
		$('body').append(html);
	}else{
		que_idx=$('#answered_user_list').attr('que_idx');
		ans_idx=$('#answered_user_list').attr('ans_idx');
		is_right=$('#answered_user_list').attr('is_right');

		html='';
		for (i=0;i<mad.length;i++){
			if (mad[i].res_idx==top.$curr_status &&
				mad[i].que_idx==que_idx &&
				(mad[i].ans_idx==ans_idx || ans_idx==0) &&
				mad[i].is_right==is_right &&
				tmp_ary.indexOf(mad[i].id)==-1){
				tmp_ary.push(mad[i].id);
				html+='<div><a href="/apps/meic/teacher_view_student.php?user_id='+mad[i].id+'&rr_id='+top.$room_id+'&g_id=&res_idx='+top.$curr_status+'&url=" target="_top">'+$('#user_'+mad[i].id+'_detail>.name',parent.document).text()+'</a></div>';
			}
		}
		$('#answered_user_list').html(html);
	}

}

function meic_black_popup(src){
	var doc_height=$(document).height();
	var doc_width=$(document).width();
	$('body').append('<div class="black_popup" style="width:100% ; height:'+doc_height+'px ; top:0; left:0 ; position:fixed ; vertical-align: middle; z-index:8000; text-align:center ; background-color:#000000;filter:alpha(opacity=50); -moz-opacity:0.5;opacity: 0.5;" id="black_layer"></div>');
	$('body').append('<div class="black_popup" style="position:fixed;top:0px;left:0px;right:0px;z-index:9000;height:100%;overflow:auto;padding:25px 10px 10px 10px;text-align: center;"><img class="black_popup_close" src="/apps/meic/engine/img/btn_close.png" style="margin-left:-30px;margin-top:6px;z-index:10000" align="top" onclick="$(\'.black_popup\').remove();"/></div>');

	$("<img/>").attr("src", src)
    .load(function() {
    	if (doc_width<=this.width){
    		$(this).attr('width',(doc_width-40));
    	}
    }).insertBefore('.black_popup_close');
}

function meic_check_path(path){
	if (path.indexOf('file://') != -1){
		path=path.substring(path.lastIndexOf('/')+1,path.length);
	}else if (path.indexOf('http://') != -1){
		path=path.substring(7,path.length);
		path=path.substring(path.indexOf('/'),path.length);
	}
	return path;
}

function meic_draw(can_draw){
	if (isInIframe){
		parent.show_draw(can_draw);
	}
}

function meic_statistics(){
	if (isInIframe){
		parent.show_class_detail_list(parent.$curr_status);
	}
}

function meic_set_font_size(size){
	$('body').css("font-size",size+"pt");
	$('.input_answer').css("font-size",size+"pt");
}

function meic_set_show_answer(val){
	if (setting_show_correct_answer!=val){
		setting_show_correct_answer=val;
		if (isInIframe){
			top.$show_answer=val;
		}
		initEngine();
	}
}

function meic_set_show_correct(val){
	if (setting_real_time_show_correct!=val){
		setting_real_time_show_correct=val;
		if (isInIframe){
			top.$show_correct=val;
		}
		initEngine();
	}
}

function meic_set_redo_times(val){
	if (setting_redo_times!=val){
		setting_redo_times=val;
		if (isInIframe){
			top.$redo_times=val;
		}
		initEngine();
	}
}
var meic_showed_correct_answer=false;
function meic_show_correct_answer(){
	if (!meic_showed_correct_answer){
		$('.submit_answer').trigger( "click" );
		meic_showed_correct_answer=true;
	}else{
		//window.location=window.location;
		$('.question_div[type="MC"]').find(".answer").css({'background-color':'transparent'});
		$('.question_div[type="MMC"]').find(".answer").css({'background-color':'transparent'});
		$('.matching_right_line').remove();
		$('.correct_answer').html('');
		$('.correct_answer').removeAttr('show_answer');
		meic_showed_correct_answer=false;
	}
}
