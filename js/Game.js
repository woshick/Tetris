(function(){
	//游戏类
	var Game = window.Game = function(){
		//画布、上下文
		// this.canvas = document.getElementsByTagName("canvas")[0];
		// this.ctx = this.canvas.getContext("2d");
		//帧编号
		this.frameNumber = 0;
		//分数
		this.score = 0;
		//时间
		this.during = 0;
		//等级
		this.level = 0;
		window.renderpic=function(blockunit){
			for(var row = 0 ; row < 4 ; row++){
				for(var col = 0 ; col < 4 ; col++){
					tdss[row][col].className ="";
				}
			}
			var blocks =  blockunit.blocksArray;
			for (var i = 0; i < blocks.length; i++) {
				tdss[blocks[i].i][blocks[i].j].className = "block" +blockunit.shape;
			}
		} 

		//加载图片
		// this.blockPic = new Image();
		// this.blockPic.src = "images/block.png";
		//数字图片
		// this.numberPicArr = [];
		// for(var i = 0 ; i <= 9 ; i++){
		// 	var image = new Image();
		// 	image.src = "images/number_score_0" + i + ".png";
		// 	this.numberPicArr.push(image);
		// }

		//备份this
		var self = this;
		//所有图片数组
		// var images = [this.blockPic].concat(this.numberPicArr);
		// var count = 0;	//已经加载的图片个数
		//加载图片
		// for(var i = 0 ; i < images.length ; i++){
		// 	images[i].onload = function(){
		// 		count++;
		// 		if(count == images.length){
					self.init();
					self.start();
		// 		}
		// 	}
		// }
	}
	//初始化
	Game.prototype.init = function(){
		//***********************************
		//* 创建表格
		//***********************************
		div = document.getElementsByTagName("div")[0]
		table = document.getElementsByTagName("table")[0];
		table1 = document.getElementsByTagName("table")[1];
		tds1 = table1.getElementsByTagName("td");
		tdss =[];
		//方块预览
		arrim =[];
		arrim.push( new BlockUnit(0,4));
		arrim.push( new BlockUnit(0,4));
		//预览表格
		for(var row = 0 ; row < 4 ; row++){
			var arr = [];
			for(var col = 0 ; col < 4 ; col++){
				arr.push(tds1[row*4+col]);
			}
			tdss.push(arr);
		}
		//预览图片
		renderpic(arrim[1]);
		tds = [];
		//创建表格，这里没有注释了，哈哈哈哈哈，贪吃蛇有相同的业务
		for(var row = 0 ; row < 20 ; row++){
			var oTR = document.createElement("tr");
			table.appendChild(oTR);
			var arr = [];
			for(var col = 0 ; col < 12 ; col++){
				var oTD = document.createElement("td");
				oTR.appendChild(oTD);
				arr.push(oTD);
			}
			tds.push(arr);
		}


		
		//自己的地图
		this.map = new Map();
		//自己的活动体
		// this.blockunit = new BlockUnit(3,6);
		this.blockunit = arrim[0];

		//备份this
		var self = this;

		//键盘监听
		document.onkeydown = function(event){
			//左、上、右、下：37、38、39、40
 			switch (event.keyCode){
 				case 37:
 					self.goLeft();
 					break;
				case 39:
 					self.goRight();
 					break;
				case 38:
					self.blockunit.changeDirection();//不能旋转，默认无操作
					break;
				case 32 , 40:
					//空格键、下键
					while(self.goDown()){

					}
 			}
		}
	}

	//主循环
	Game.prototype.mainloop = function(){
		//清屏
		// this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
		for(var row = 0 ; row < 20 ; row++){
			for(var col = 0 ; col < 12 ; col++){
				tds[row][col].className = "";
			}
		}
		//帧编号++
		this.frameNumber++;
		//打印帧编号
		// this.ctx.fillText(this.frameNumber, 10 , 10);

		//渲染组合体
		this.blockunit.render();
		renderpic(arrim[1]);

		//间隔帧数
		var jiange = (50 - this.level * 10);
		if(jiange < 10){
			jiange = 10;
		}
		//下落逻辑：
		if(this.frameNumber % jiange  == 0){
			this.goDown();
		}
		//地图渲染
		this.map.render();
		//渲染分数
		// this.drawNumber(this.score , 300,40);
		
		//时间每秒更新
		if(this.frameNumber % 50 == 0){
			this.during ++;
		}
		//渲染时间
		// this.drawNumber(this.during , 300,130);

		//每帧都判断当前是多少等级
		this.level = parseInt(this.score / 5);
		//渲染等级
		// this.drawNumber(this.level , 300,230);
		div.innerHTML= "frameNumber:"+this.frameNumber+"<br/>score:"+this.score+"<br/>time:"+this.during+"<br/>level:"+this.level;
	}
	//左移动
	Game.prototype.goLeft = function(){
		var cc = this.blockunit.col - 1;
		if(this.blockunit.canMove(this.blockunit.row , cc)){
			this.blockunit.moveTo(this.blockunit.row , --this.blockunit.col);
		}
	}
	//右边移动
	Game.prototype.goRight = function(){
		var cc = this.blockunit.col + 1;
		if(this.blockunit.canMove(this.blockunit.row , cc)){
			this.blockunit.moveTo(this.blockunit.row , ++this.blockunit.col);
		}
	}
	//方块下落
	Game.prototype.goDown = function(){
		//让转块下落：
		var rr = this.blockunit.row + 1;
		//先来判断是不是能下落
		var yesorno = this.blockunit.canMove(rr , this.blockunit.col);
		if(!yesorno){
			//console.log("不能下落了");
			//这里就是不能下落的业务，具体是3个事儿：
			// 1)把blockunit持有的blocksArray变为map.blocksArray。或砖块要变为死砖块
			this.map.blocksArray = this.map.blocksArray.concat(this.blockunit.blocksArray);
			
			// 2)改变map的codes，这个业务是比较难的。可以说是全游戏最难。
			for(var r = 0 ; r <= 3 ; r++){
				//得到第r + blockunit.row行的地图code 和 第r行的blockunit.code
				var themapcode = this.map.code[this.blockunit.row + r];
				var theblockunit = (this.blockunit.shapeCode >> ((3 - r)*4)) & 0xf;  //blockunit的砖块码0x4460
				 
				//然后进行计算：
				this.map.code[this.blockunit.row + r] = themapcode | (theblockunit << (10 - this.blockunit.col));//合并死掉的砖块  14-4 - this.blockunit.col
			}
			// 3)new一个新转块
			// this.blockunit = new BlockUnit(0,4);
			this.blockunit = arrim[1];
			arrim.shift();
			arrim.push(new BlockUnit(0,4)) ;
			//测试能不能new出来，如果不能就是死了。
			if(!this.blockunit.canMove(0,4)){
				clearInterval(g.timer);
				alert("game over");
			}
			// 4)消行判定
			this.map.check();
		}else{
			this.blockunit.row  = this.blockunit.row + 1;
			this.blockunit.moveTo(rr , this.blockunit.col);
		}

		return yesorno;
	}
	//开始游戏
	Game.prototype.start = function(){
		// 备份this
		var self = this;
		//开始主循环
		this.timer = setInterval(function(){
			self.mainloop();
		},20);
	}
	//渲染数字
	// Game.prototype.drawNumber = function(number,x,y){
	// 	//86
	// 	for(var i = 0 ; i < number.toString().length ; i++){
	// 		this.ctx.drawImage(this.numberPicArr[parseInt(number.toString().charAt(i))], x + 14 * i, y);
	// 	}
	// }
})();