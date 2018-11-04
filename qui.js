class QUIrenderer {
	constructor(url) {
		//synchronous req is deprecated, but i need to save JSON as var
		var tmp=new XMLHttpRequest();
		tmp.open("GET",url, false)
		tmp.send("")
		this.board=JSON.parse(tmp.responseText)

		this.screenx=window.innerWidth //gets full window size
		this.screeny=window.innerHeight

		this.sizex=this.screenx/this.board["x"] //size of each individual box in grid
		this.sizey=this.screeny/this.board["y"]

		this.canv=document.getElementById("c") //gets canvas and makes disp obj for displaying boxes etc
		this.disp=this.canv.getContext("2d")

		this.mousex=0
		this.mousey=0

		this.mouse=function(e){
			this.mousex=e.clientX
			this.mousey=e.clientY
			this.clicked()
		}

		this.mouseh=this.mouse.bind(this) //mouse handler
		this.canv.addEventListener("click", this.mouseh, false)

		this.disp.canvas.width=this.screenx //resizes canvas
		this.disp.canvas.height=this.screeny
	}
	init() { //loads the board to the screen
		if (this.board["bg"]["type"]=="color")
			this.rect(this.board["bg"]["value"], 0,0,this.screenx,this.screeny)

		for(var i of this.board["board"]) { //for each box in the board
			this.rect(i["color"], ...this.grid(i["box"])) //draw outline
		}
	}
	rect(color, x1, y1, x2, y2) {
		this.disp.fillStyle=color
		this.disp.fillRect(x1,y1,x2,y2)
	}
	action(s) { //runs JS code from string
		var tmp=new Function(s)
		return(tmp())
	}
	clicked() {
		var tempx=~~(this.mousex/this.sizex)
		var tempy=~~(this.mousey/this.sizey)
		for (var k of this.board["board"]) {
			if (tempx>=k["box"][0]&&tempx<k["box"][0]+k["box"][2]&&tempy>=k["box"][1]&&tempy<k["box"][1]+k["box"][3]) {
				this.action(k["action"])
				//return k;
			}
		}

		/*
		for (var i=0;i<this.board["x"];i++) {
			for (var j=0;j<this.board["y"];j++) {
				//console.log(this.mousex>=i*this.sizex,this.mousex<(i+1)*this.sizex,this.mousey>j*this.sizey,this.mousey<(j+1)*this.sizey)
				if (this.mousex>=i*this.sizex&&this.mousex<=(i+1)*this.sizex&&this.mousey>=j*this.sizey&&this.mousey<=(j+1)*this.sizey) {
					alert("HERE I:"+j+" J:"+j)
					for (var k of this.board["board"]) {
						//if (tempx>=k["box"][0]&&tempx<k["box"][2]&&tempy<=k["box"][1]&&tempy<=k["box"][3]) {
						if (i>=k["box"][0]&&i<k["box"][2]&&j<=k["box"][1]&&j<=k["box"][3]) {
							this.action(k["action"])
							//return k;
						}
					}
				}
			}
		}*/
	}
	grid(box) { //returns cords for grid based on grid size and screen size
		//alert([box[0]*this.screenx,box[1]*this.screeny,box[2]*this.screenx,box[3]*this.screeny])
		return [box[0]*this.sizex,box[1]*this.sizey,box[2]*this.sizex,box[3]*this.sizey]
	}
}
