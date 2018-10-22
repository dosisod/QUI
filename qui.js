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

		this.canv=document.getElementById("c")
		this.disp=this.canv.getContext("2d")

		this.disp.canvas.width=this.screenx //resizes canvas
		this.disp.canvas.height=this.screeny
	}
	init() {
		this.disp.fillStyle=this.board["bg"]
		this.disp.fillRect(0,0,this.screenx,this.screeny)

		for(var i of this.board["board"]) {
			console.table(i)
		}
	}
}
