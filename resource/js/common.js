

;(function ($, win, doc, undefined) {
	
	var namespace = 'olliza';

	$.fn.inView = function() {
		var $el = $(this);
		var _flag = false;

		var _top = $el.offset().top;
		var _left = $el.offset().left;
		var _height = $el.outerHeight();
		var _width = $el.outerWidth();

		_flag = _top < (window.pageYOffset + window.innerHeight) &&
				_left < (window.pageXOffset + window.innerWidth) &&
				(_top + _height) > window.pageYOffset &&
				(_left + _width) > window.pageXOffset;

		return _flag;
	};

	win[namespace] = {
		status: {
			scrollY: 0,
			scrollDirection: '',
			scrollOverElement: function(delta){
				return win[namespace].status.scrollY > delta ? true : false;
			},
			scrollIsHome: function(){
				return win[namespace].status.scrollY === 0 ? true : false;
			},
			scrollIsEnd: function(){
				return win[namespace].status.scrollY + $(win).outerHeight() === $(doc).outerHeight() ? true : false;
			},
			scrollCheck: {
				beforeScrollY: 0,
				direction: function(){
					return win[namespace].status.scrollCheck.beforeScrollY < win[namespace].status.scrollY ? 
						'down' : 'up';
				},
				init: function(){
					function bodyAddClass() {
						var $body = $('body');
						if (!!win[namespace].status.scrollIsHome()) {
							$body.addClass('is-home');
						} else if (!!win[namespace].status.scrollIsEnd()) {
							$body.addClass('is-end');
						} else {
							$body.removeClass('is-home is-end');
						}
					}
					win[namespace].status.scrollY = $('html').prop('scrollTop');
					win[namespace].status.scrollIsHome();
					win[namespace].status.scrollIsEnd();
					bodyAddClass();

					$(doc).off('scroll.scrollCheck').on('scroll.scrollCheck', function(){
						win[namespace].status.scrollY = $('html').prop('scrollTop');
						win[namespace].status.scrollDirection = win[namespace].status.scrollCheck.direction();
						win[namespace].status.scrollCheck.beforeScrollY = win[namespace].status.scrollY;
						win[namespace].status.scrollIsHome();
						win[namespace].status.scrollIsEnd();
						bodyAddClass();
					});

				}
			}
		},
		navFixed: {
			headerY: 0,
			beforeY: false,
			afterY: false,
			init: function(){
				$('.header-area').removeClass('fixed');
				$(win).off('scroll.scrollNavFixed').on('scroll.scrollNavFixed', function(){
					var $header = $('.header-area');
					var $banner = ($(win).outerWidth() > 500) ? $('.banner-area') : $('.slider-banner')
					var headerY = $banner.offset().top + $banner.outerHeight();
					var beforeY = win[namespace].navFixed.beforeY;
					var afterY = win[namespace].status.scrollOverElement(headerY);

					if (beforeY !== afterY) {
						
						if (afterY && !$header.hasClass('fixed')){
							$header.addClass('fixed');
						} else {
							$header.removeClass('fixed');
						}
						win[namespace].navFixed.beforeY = afterY;
					}

				});
			}
		},
		navLoad: function(){
			(function () {
				return new Promise(function(resolve, reject) {
					$.get('/olliza/include/header.html', function(response) {
						if (response) {
							resolve(response);
						}
						reject(new Error('Request is failed'));
					});
				});
			})()
			.then(function(data) {
				$('.header-area').html(data);
				// win[namespace].nav.hoverMenu(); // hover evt on nav
				win[namespace].nav.slidingMenu(); // show/hide evt on nav
				// win[namespace].nav.openDepth2(); // 2depth links evt on nav
				
				
			}).catch(function(err) {
				console.error('win.'+namespace+'.navLoad failed!!');
			});
		},
		footerLoad: function(){
			(function () {
				return new Promise(function(resolve, reject) {
					$.get('/olliza/include/footer.html', function(response) {
						if (response) {
							resolve(response);
						}
						reject(new Error('Request is failed'));
					});
				});
			})().then(function(data) {
				$('.footer-area').html(data);
			}).catch(function(err) {
				console.error('win.'+namespace+'.footerLoad failed!!');
			});
		},
		nav: {
			hoverMenu: function(){
				var $header = $('.header-area');
				var $links = $header.find('.gnb-area a');
				var flag = {};

				$links
          .off('.openMenuPC')
          .on('mouseenter.openMenuPC focus.openMenuPC', function () {
						$header.addClass('hover');
						clearTimeout(flag);
            $header
              .off('.closeMenuPC')
              .on('mouseleave.closeMenuPC', removeHover);
            $links.off('.closeMenuPC').on('blur.closeMenuPC', removeHover);
          });
					
				function removeHover() {
					flag = setTimeout(function () {
            $header.removeClass('hover');
          }, 1);
        }
			},
			slidingMenu: function(){
				var $header = $('.header-area');
				var $btnMenu = $header.find('.btn-menu');
				
				$btnMenu
					.off('.openMenu')
					.on('click.openMenu', function(){
						$header.toggleClass('open');
					});
			},
			openDepth2: function(){
				var $header = $('.header-area');
				var $listDepth1 = $header.find('.nav-d1 > li');
				var $btnDepth1 = $listDepth1.children('a');

				console.log($btnDepth1)
				$btnDepth1.on('click', function(e){
					if ($(win).outerWidth() < 1025 && !!$(this).siblings('.nav-d2').length) {
						var $parentList = $(this).closest('li');
						e.preventDefault();
						$listDepth1.not($parentList).removeClass('on');
						$parentList.toggleClass('on');
					}
				})

			}
		},
		mainSlider: {
			slide: {},
			init: function(){
				win[namespace].mainSlider.slide = $('.slider-visual .slider-inner').slick({
					infinite: true,
					speed: 400,
					autoplay: true,
					autoplaySpeed: 5000,
					arrows: false,
					pauseOnHover: false,
					dots: true,
					appendDots: '.slider-pagination',
					customPaging : function(slider, idx) {
							return '<a href="#">'+ ((idx < 9)?'0'+ ++idx : ++idx) +'</a>';
					},
				})

				$('.btn-rolling').on('click', function(){
					if ($(this).hasClass('play')) {
						$(this).removeClass('play');
						$(this).addClass('pause');
						$('.slider-visual .slider-inner').slick('slickPlay');
					} else {
						$(this).removeClass('pause');
						$(this).addClass('play');
						$('.slider-visual .slider-inner').slick('slickPause');
					}
				})
			}
		},
		skillAni:{
			timer: {},
			init: function(isShow){
				var _idx = 0;
				var $item = $('.skill-list li');

				clearInterval(win[namespace].skillAni.timer);
				if (win[namespace].checkBrowserSize() === 'mobile') { 
					$item.removeClass('active');
					return false;
				 }
				win[namespace].skillAni.timer = setInterval(function(){
					$item.removeClass('active');
					$item.eq(_idx).addClass('active');
					if (_idx > 6) {
						_idx = 0;
					} else {
						_idx++;
					}
				}, 2000)
			}
		},
		guideVod: function() {
			var $item = $('.guide-list .item');

			$item.on('click', function(){
				var _prev = $(this).attr('data-status');
				var $now = $item.filter('[data-status="active"]');

				if (win[namespace].checkBrowserSize() !== 'mobile') {
					if (_prev !== 'active'){
						$now.attr('data-status', _prev);
						$(this).attr('data-status', 'active');
						videojs($now.find('.video-js').attr('id')).pause();
					}
				} else {
					videojs($item.not($(this)).find('.video-js').eq(0).attr('id')).pause();
					videojs($item.not($(this)).find('.video-js').eq(1).attr('id')).pause();
				}
			})
		},
		isBrowser: function(){
			var agt = navigator.userAgent.toLowerCase(); 
			if (agt.indexOf("chrome") != -1) return 'Chrome'; 
			if (agt.indexOf("opera") != -1) return 'Opera'; 
			if (agt.indexOf("staroffice") != -1) return 'Star Office'; 
			if (agt.indexOf("webtv") != -1) return 'WebTV'; 
			if (agt.indexOf("beonex") != -1) return 'Beonex'; 
			if (agt.indexOf("chimera") != -1) return 'Chimera'; 
			if (agt.indexOf("netpositive") != -1) return 'NetPositive'; 
			if (agt.indexOf("phoenix") != -1) return 'Phoenix'; 
			if (agt.indexOf("firefox") != -1) return 'Firefox'; 
			if (agt.indexOf("safari") != -1) return 'Safari'; 
			if (agt.indexOf("skipstone") != -1) return 'SkipStone'; 
			if (agt.indexOf("netscape") != -1) return 'Netscape'; 
			if (agt.indexOf("mozilla/5.0") != -1) return 'Mozilla'; 
			if (agt.indexOf("msie") != -1) { 
					var rv = -1; 
				if (navigator.appName == 'Microsoft Internet Explorer') { 
					var ua = navigator.userAgent; var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})"); 
				if (re.exec(ua) != null) 
					rv = parseFloat(RegExp.$1); 
				} 
				return 'IE '+rv; 
			} 
		},
		cookieControl: {
			setCookie: function ( name, value, expiredays ) {
				var todayDate = new Date();
				todayDate.setDate( todayDate.getDate() + expiredays );
				document.cookie = name + '=' + escape( value ) + '; path=/; expires=' + todayDate.toGMTString() + ';'
				console.log(document.cookie);
			},
			isHasCookie: function () {
				var cookiedata = document.cookie;
				console.log(cookiedata);
				if ( cookiedata.indexOf('todayCookie=done') < 0 ){
						return false;
				}
				else {
						return true;
				}
			}
		},
		scrollToTop: function(){
			$('.floating-util .top').on('click', function(){
				$('body, html').animate({
					scrollTop: 0
				}, 200)
			})
		},
		checkBrowserSize: function(){
			var _winW = $(win).outerWidth();
			var size = '';
			
			if (_winW < 764) {
				size = 'mobile';
			} else if (_winW < 1025) {
				size = 'tablet';
			} else {
				size = 'pc';
			}
			$('html').attr('data-size', size);

			return size;
		},
		isInview: function($el, callback){
			$.extend({}, {
				inBack: function() {},
				outBack: function() {}
			}, callback)
			$(doc).on('scroll.'+namespace, function(){
				if ($el.inView()) {
					$el.addClass('ui-in');
				} else {
					$el.removeClass('ui-in');
				}
			});
		},
		stepRolling: {
			flag: false,
			init: function(){
				var $wrap = $('.register-area');
				if (!$wrap.hasClass('ui-in')) { 
					$wrap.stop().scrollLeft(0);
					win[namespace].stepRolling.flag = false;
				} else if (!win[namespace].stepRolling.flag) {
					win[namespace].stepRolling.flag = true;
					$wrap.animate({
						scrollLeft: 600
					}, 12000, 'linear');

					$wrap.on('touchstart', function(){
						$wrap.stop();
					})
				}
			}
		},
		accoInfo: function(){
			$('.btn-acco').off('click.accoInfo').on('click.accoInfo', function(){
				var $ts = $(this);
				var $target = $('#'+$ts.attr('data-pnl'));
				if ($ts.hasClass('open')) { 
					$ts.removeClass('open');
					$target.stop().slideUp(200);
				} else {
					$ts.addClass('open');
					$target.stop().slideDown(200);
				}
			})
		},
		tab: {
			init: function(){
				$('.ui-tab').each(function(idx, item){
					var $wrap = $(item);
					var $btns = $wrap.find('.ui-tab-btn');
					var $pnl = $wrap.find('.ui-tab-pnl');
					var $nowBtn = $btns.filter('.selected');
					var _idx = $btns.index($nowBtn);
					
					console.log($('.ui-tab'));
					$pnl.eq(_idx).show();
				})
				$('.ui-tab-btn').on('click', function(){
					var $ts = $(this);
					var $wrap = $ts.closest('.ui-tab');
					var $btns = $wrap.find('.ui-tab-btn');
					var idx = $btns.index($ts);
					var $pnls = $wrap.find('.ui-tab-pnl');
					
					$btns.removeClass('selected');
					$ts.addClass('selected');
					$pnls.hide();
					$pnls.eq(idx).show();
				})
			}
		},
		modal:{
			open: function(targetId){
				if (!$('.layer-wrap').length) {
					$('main').append($('<div class="layer-wrap"></div>'));
				}
				
				var $bg = $('.layer-wrap');
				var $target = $('#' + targetId);

				$bg.show();
				$target.appendTo($bg).show().addClass('open');
			},
			close: function(targetId) {
				var $bg = $('.layer-wrap');
				var $target = $('#' + targetId);
				var _isVisible = false;

				$target.hide().removeClass('open');
				$bg.find('.ui-modal').each(function(idx, item){
					_isVisible = !!$(item).is(':visible') ? true : _isVisible;
				})
				if (!_isVisible){
					$bg.hide();
				}
			}
		},
		/**
		 * @author eunjye
		 * @date 2021/07/05
		 * @param opt {object}
		 */
		dialog: {
			activeDialog: [],
			defaultOption: {
				targetDialog: {},
				position: 'center',
				removeTag: true,
				dialogId: null,
				callback: {
					open: function(){},
					close: function(){}
				}
			},
			close: function(_id) {
				var _ = win[namespace].dialog;
				var dialogId = _id;
				var $targetDialog = $('[data-dialog-id="' + dialogId + '"]');
				if (_id.charAt(0) === '#' || _id.charAt(0) === '.') {
					$targetDialog = $(_id);
				} 
				var option = $targetDialog.data('dialogOption');
				var $targetDim = $targetDialog.closest('.dialog-dim');

				$targetDim.removeClass('showing');
				
				setTimeout(function(){
					if (!!option.removeTag) {
						$targetDim.remove();
					} else {
						$targetDim.removeClass('show');
						$targetDim.hide();
					}

					option.callback.close();
				}, 350);
				
				_.activeDialog[parseInt(dialogId.replace(/[^0-9]/g,''))] = null;

			},
			open: function(opt){
				var _ = win[namespace].dialog;
				var option = $.extend(true, _.defaultOption, opt);

				var $dialogWrap;

				if (option.targetDialog.url !== undefined) {
					$.ajax({
						url: option.targetDialog.url,
						dataType: 'html',
						success: function (data) {
							$dialogWrap = $(data);
							$('main#wrap').append($dialogWrap);
							openDialog();
						}
					})
				} else {
					$dialogWrap = option.targetDialog.element;
					openDialog();
				}
				
				function openDialog() {
					var activeLength = _.activeDialog.length;
					var dialogId = !!option.dialogId ? option.dialogId : 'dialog' + activeLength;
					
					_.activeDialog.push(dialogId);

					if ($dialogWrap.closest('.dialog-dim').length < 1) {
						$dialogWrap.wrap($('<div class="dialog-dim"></div>'));
					}

					var $dialogDim = $dialogWrap.closest('.dialog-dim');
					
					$dialogDim.addClass('showing');

					$dialogDim.css('z-index', 10 + activeLength).addClass('show ' + option.position).show();
					$dialogWrap.attr('data-dialog-id', dialogId).data('dialogOption', option);

					option.callback.open();

					$dialogWrap.find('.dialog-close-btn').off('click.dialogClose').on('click.dialogClose', function(){
						_.close(dialogId)
					});
				}
			}
		},
		initCanvas: function() {
			var canvas = document.querySelector('#canvasGraph');
			var ctx = canvas.getContext('2d');

			var size = 0;
			var distance = 100;
			var zeroPoint = {
				x: 320,
				y: 330
			}
			var degree = (Math.PI * 2) / 5;

			function drawPentagon() {
				ctx.beginPath();
				ctx.clearRect(0, 0, canvas.width, canvas.height);
				ctx.save();
				ctx.translate(zeroPoint.x, zeroPoint.y);
				ctx.rotate(-Math.PI / 2);
				ctx.moveTo(size, 0);

				var beforeOffset = {
					x: size,
					y: 0,

					x2: size + distance,
					y2: 0
				};
				for (var i = 1; i <= 5; i++) {
					ctx.beginPath();
					ctx.moveTo(beforeOffset.x, beforeOffset.y);
					ctx.lineTo(size * Math.cos(degree * i), size * Math.sin(degree * i));
					ctx.lineWidth = 70;
					switch (i) {
						case 1:
							ctx.strokeStyle = '#f377e6';
							break;
						case 2:
							ctx.strokeStyle = '#6957d0';
							break;
						case 3:
							ctx.strokeStyle = '#57b7d0';
							break;
						case 4:
							ctx.strokeStyle = '#b77cf0';
							break;
						case 5:
							ctx.strokeStyle = '#579dd0';
							break;
					}

					ctx.stroke();
					ctx.closePath();


					// ctx.beginPath();
					// ctx.moveTo(beforeOffset.x2, beforeOffset.y2);
					// ctx.lineTo((size + distance) * Math.cos(degree * i), (size + distance) * Math.sin(degree * i));
					// ctx.lineWidth = 1;
					// ctx.strokeStyle = 'rgba(255,255,255,0.7)';
					// ctx.stroke();
					// ctx.closePath();

					beforeOffset = {
						x: size * Math.cos(degree * i),
						y: size * Math.sin(degree * i),

						x2: (size + distance) * Math.cos(degree * i),
						y2: (size + distance) * Math.sin(degree * i)
					}
				}

				ctx.fillStyle = 'white';
				ctx.fill();

				ctx.restore();

				var maxSize = 230;

				if (size < maxSize - 30) {
					size += 7;
					requestAnimationFrame(drawPentagon);
				} else if (size < maxSize - 10) {
					size += 5;
					requestAnimationFrame(drawPentagon);
				} else if (size < maxSize) {
					size += 4;
					requestAnimationFrame(drawPentagon);
				} else {
					cancelAnimationFrame(drawPentagon);
					drawCircle();
				}

			}

			var dotOrder = 0;
			var dotAlpha = 0;

			function drawCircle() {

				ctx.save();
				ctx.translate(zeroPoint.x, zeroPoint.y);
				ctx.rotate(-Math.PI / 2);

				var arrDotOrder = [5, 1, 2, 3, 4];

				ctx.beginPath();
				ctx.globalAlpha = dotAlpha;
				ctx.fillStyle = '#fff';
				ctx.strokeStyle = 'rgba(255,255,255,0.2)';
				ctx.lineWidth = 24;
				ctx.shadowBlur = false;
				ctx.arc(size * Math.cos(degree * arrDotOrder[dotOrder]), size * Math.sin(degree * arrDotOrder[dotOrder]), 50, 0, Math.PI * 2);
				ctx.stroke();
				ctx.fill();

				ctx.restore();

				if (dotAlpha <= 1/2) {
					dotAlpha += 1/20;
					requestAnimationFrame(drawCircle);
				} else if (dotOrder < 4) {
					dotAlpha = 0;
					
					setTimeout(function(){
						dotOrder++;
						requestAnimationFrame(drawCircle);
					}, 150);
				} else {
					cancelAnimationFrame(drawCircle);
					$('.graph-area').addClass('done');
				}
			}

			drawPentagon();

		},

		init: function(){

			$(win).off('.'+namespace)
				.on('resize.'+namespace, function(){
					win[namespace].checkBrowserSize();
					win[namespace].skillAni.init(true);
				});

			$(doc).on('ready.'+namespace, function(){
				win[namespace].checkBrowserSize();
				$('html').addClass(win[namespace].isBrowser());
				win[namespace].navLoad();
				win[namespace].footerLoad();
				win[namespace].status.scrollCheck.init();
				win[namespace].guideVod();
				win[namespace].scrollToTop();
				win[namespace].accoInfo();
				win[namespace].tab.init();

				if (!!$('.ui-inview').length) {
					$('.ui-inview').each(function(idx, item){
						win[namespace].isInview($(item));
					})
					win[namespace].skillAni.init(true);
				}
				win[namespace].nav.hoverMenu(); // hover evt on nav
				win[namespace].nav.slidingMenu(); // show/hide evt on nav
				win[namespace].nav.openDepth2(); // 2depth links evt on nav

				$('.header-area').addClass('fixed');
				
        $(doc).on('click', '.btn-top', function () {
          $('body, html').animate({
            scrollTop: 0
          }, 200)
        })
				
			})
			$(doc).on('scroll.'+namespace, function(){
				win[namespace].stepRolling.init();
			})
		}
	}
	
	win[namespace].init();
})(jQuery, window, document);