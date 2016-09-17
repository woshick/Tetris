(function(){
	//组合体构造函数，组合体就是一个4*4
	//为了设计方便，我们地图物理上是20行，12列。但是为了一会儿方便
	//我们把地图设计为逻辑上22行，16列。也就是说给物理画布左侧加2列，右侧加2列，底部加2行。
	//row的合法值是0~21
	//col的合法值是-2~13
	//shape的合法值是0~6
	var BlockUnit = window.BlockUnit = function(row,col,shape,direction){
		this.row = row;
		this.col = col;
		//自己的形状，是个字符串，比如"O"。当传进来一个参数的时候，就用这个参数，没有就随机
		this.shape = shape != undefined ? shape : _.random(0,shapeCodes.length - 1);
		//自己的所有可能地图形态，是个数组，形如[0x44c0,0x8e00,0x6440,0x0e20]
		this.shapeCodes = shapeCodes[this.shape];
		//可能的方向总数
		this.directionAmount = this.shapeCodes.length;
		//自己的方向，我们要随机产生一个。
		this.direction = direction != undefined ? direction : _.random(0,this.directionAmount - 1);

		//console.log(this.shape,this.direction,this.directionAmount);
		//自己的此时地图形态，这个数值，形如0x6440
		this.shapeCode = this.shapeCodes[this.direction];
		//自己的转块，这个数组里面存放的是block类型的对象
		this.blocksArray = [];
		//遍历自己的shapeCode，new出来相应的block。放入自己的blocksArray里面。
		for(var i = 0 ; i < 4 ; i++){
			//第i行
			var r = this.shapeCode >> (3 - i) * 4 & 0xf;
			//继续拆这个r
			for(var j = 0 ; j < 4 ; j++){
				var char = r >> (3 - j) & 0x1;
				//至此我们成功的拿到了第r行第i列的情形(要么是0要么是1)。
				if(char){
					//根据自己的shapeCode改变自己的数组
					var b = new Block(this.row + i , this.col + j , this.shape);
					//给这个小b补属性，i表示相对于组合体自己的row数，0~3
					//给这个小b补属性，j表示相对于组合体自己的col数，0~3
					b.i = i;
					b.j = j;
					this.blocksArray.push(b);
				}
			}
		}
	}
	BlockUnit.prototype.changeDirection = function(){
		var direction = this.direction + 1;
		if(direction > this.directionAmount - 1){
			direction = 0;
		}

		var tempshapecode = shapeCodes[this.shape][direction];
		//在这里先验证能否旋转
		var mapcode = g.map.code;
		for(var i = 0 ; i <= 3 ; i++){
			//地图的那一行
			var r = mapcode[this.row + i];
			//地图的那一行的4个0或1：
			var mapchar = r >> (10 - this.col) & 0xf; // 00|0000|0000|0000|00  12-col-4+2==10 - this.col
			//这个块的char
			var thischar = tempshapecode >> (3 - i) * 4 & 0xf;
 			//4个位和4个位的比较，如果比出了不是0，就是冲突，不能移动到哪里去。
			if((mapchar & thischar) != 0){
				return false;//不能旋转，默认无操作
			}
		}
		//重新new一个组合体出来。现在这个组合体没有任何变量持有它，就会被当做垃圾回收
		g.blockunit = new BlockUnit(this.row , this.col , this.shape , direction);
	}
	
	//测试能否移动到某个位置
	//row的合法值是0~21
	//col的合法值是-2~10
	BlockUnit.prototype.canMove = function(row,col){//col可为-1
		if(col > 10 || col < -2){ //防止长条出去
			return false;
		}
		//测试自己能否移动到一个地方
		//这里要验证一下，是不是可以moveTo。
		//组合体持有一个4*4，我现在要moveTo一个地方，ok，我看看要moveTo的那个地方的4*4的情形如何？
		//所以，我们看g.map.code
		var mapcode = g.map.code;
		for(var i = 0 ; i <= 3 ; i++){
			//地图的那一行
			var r = mapcode[row + i];
			//地图的那一行的4个0或1：
			var mapchar = r >> (10 - col) & 0xf;
			//这个块的char
			var thischar = this.shapeCode >> (3 - i) * 4 & 0xf;
 			//4个位和4个位的比较，如果比出了不是0，就是冲突，不能移动到哪里去。
			if((mapchar & thischar) != 0){
				return false;
			}
		}
		return true;
	}
	//移动到，将这个组合体移动到一个位置。
	BlockUnit.prototype.moveTo = function(row,col){
 		this.row = row;
 		this.col = col;
 		//blockArray数组里面的block都需要进行移动
 		_.each(this.blocksArray , function(block){
 			block.row = row + block.i;
 			block.col = col + block.j;
 		});
	}
	//渲染
	BlockUnit.prototype.render = function(){
		//老实说，BlockUnit是不能render的。是它里面的所有block进行render。
		_.each(this.blocksArray,function(block){
			block.render();
		});
	}


	var shapeCodes = [
		[0x0660],
		[0x4460,0x0e80,0xc440,0x2e00],
		[0x44c0,0x8e00,0x6440,0x0e20],
		[0xc600,0x2640],
		[0x4620,0x6c00],
		[0xe400,0x4c40,0x4e00,0x4640],
		[0x4444,0x0f00]
	]
})();