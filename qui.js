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

		this.canv.addEventListener('click', this.mouse, false) //listens on canv obj for mouse clicks

		this.disp.canvas.width=this.screenx //resizes canvas
		this.disp.canvas.height=this.screeny
	}
	mouse() { //figures out what box was clicked on based off of mouse pos
		//
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
	grid(box) { //returns cords for grid based on grid size and screen size
		alert([box[0]*this.screenx,box[1]*this.screeny,box[2]*this.screenx,box[3]*this.screeny])
		return [box[0]*this.sizex,box[1]*this.sizey,box[2]*this.sizex,box[3]*this.sizey]
	}
}
