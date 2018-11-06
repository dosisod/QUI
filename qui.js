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
			this.action(this.clicked()["action"]) //runs JS code from clicked on grid
		}

		this.mouseh=this.mouse.bind(this) //mouse handler
		this.canv.addEventListener("click", this.mouseh, false)

		this.disp.canvas.width=this.screenx //resizes canvas
		this.disp.canvas.height=this.screeny
	}
	init() { //loads the board to the screen
		if (this.board["bg"]["type"]=="color") {
			this.rect(this.board["bg"]["value"], [0,0,this.screenx,this.screeny]) //draws background
		}

		for(var i of this.board["board"]) { //for each box in the board:
			this.rect(i["color"], this.grid(i["box"])) //draw outline
			this.text(i["text"], this.grid(i["box"])) //render text
		}
	}
	rect(color, box) { //draws box of certain color at given pos
		console.log(color, box)
		this.disp.fillStyle=color
		this.disp.fillRect(box[0], box[1], box[2], box[3])
	}
	text(str, box) { //renders text at given pos
		this.disp.font="48px monospace"
		this.disp.fillStyle="black"
		this.disp.fillText(str, box[0], box[1]+50)
	}
	action(s) { //runs JS code from string
		var tmp=new Function(s)
		return(tmp())
	}
	clicked() { //finds out what grid was clicked based off mouse pos
		var tempx=~~(this.mousex/this.sizex)
		var tempy=~~(this.mousey/this.sizey)
		for (var k of this.board["board"]) {
			if (tempx>=k["box"][0]&&tempx<k["box"][0]+k["box"][2]&&tempy>=k["box"][1]&&tempy<k["box"][1]+k["box"][3]) {
				//this.action(k["action"])
				return k;
			}
		}
	}
	grid(box) { //returns cords for grid based on grid size and screen size
		return [box[0]*this.sizex,box[1]*this.sizey,box[2]*this.sizex,box[3]*this.sizey]
	}
}
