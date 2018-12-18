class QUIrenderer {
	constructor({url=false, str=false, json=false}) {
		this.url=url //holds url passed or false if none
		this.str=str //holds json string or false if none
		this.json=json //holds json obj or false if none
		
		this.canv=document.getElementById("c") //gets canvas and makes disp obj for displaying boxes etc
		this.disp=this.canv.getContext("2d")

		this.resize=function() { //called on screen resize
			this.update()
			this.redrawall()
		}
		this.resizeh=this.resize.bind(this) //resize handler
		window.addEventListener("resize", this.resizeh, false) //added to window to get when any resizing is done

		this.mousex=0
		this.mousey=0

		this.mouse=function(e) { //ran when mouse is clicked
			this.mousex=e.clientX
			this.mousey=e.clientY
			this.tempgrid=this.clicked() //stores current grid

			if (this.tempgrid) {
				this.action(this.tempgrid["action"]) //runs JS code from clicked on grid
			}
		}

		this.mouseh=this.mouse.bind(this) //mouse handler
		this.canv.addEventListener("click", this.mouseh, false)

		this.scroll=function(e) {
			this.scrolly=e.pageY
		}

		this.scrollh=this.scroll.bind(this)
		window.addEventListener("scroll", this.scrollh, false)

		this.disp.canvas.width=this.screenx //resizes canvas
		this.disp.canvas.height=this.screeny

		this.srcs=[] //stores all urls to be loaded into cache
		this.imgs=[] //image objs that load the images

		this.scrolly=0 //amount that the page has been scrolled
		
		this.currentgridid=undefined //current index of this.board["board"]
		this._currentgrid=undefined //undefined getter+setter obj
	}
	get currentgrid() { //when current board requesting board, grab current instance
		return this.board["grids"][this.currentgridid]
	}
	set currentgrid(box) { //when current board is set, put it into the board object
		this.board["grids"][this.currentgridid]=box
	}
	async download(url) { //downloads a board from a url
		var file=await fetch(url)
		var board=await file.text().then(e=>{return e})
		return JSON.parse(board)
	}
	async bg() {
		if (this.str) { this.board=JSON.parse(this.str) }
		else if (this.json) { this.board=this.json }
		else if (this.url) {
			//displays this board while json is being downloaded
			this.board={"x":1,"y":1,"grids":[{"box":[0,0,1,1],"text":"Loading board...","bg":{"type":"color","value":"#fff"}}]}
			this.redrawall()

			this.board=await this.download(this.url) //downloads the json
			this.refresh() //other init runs while the await is going, refresh after json is done
		}
	}
	style(boxes) { //determines what style technique to use on baclground
		for (var i=0;i<boxes.length;i++) {
			if (boxes[i]["bg"]) {
				if (boxes[i]["bg"]["type"]=="color") { //solid background color
					this.rect(boxes[i]["bg"]["value"], [...this.grid(boxes[i]["box"])]) //draws background with color
				}
				else if (boxes[i]["bg"]["type"]=="img") { //tiled background img
					if (this.imgs[this.srcs.indexOf(boxes[i]["bg"]["value"])]) { //
						if (this.imgs[this.srcs.indexOf(boxes[i]["bg"]["value"])].complete) {
							this.img(boxes[i]["bg"]["value"], [...this.grid(boxes[i]["box"])]) //draws background with image
						}
					}
				}
				else if (boxes[i]["bg"]["type"]=="img64") {
					this.img64(boxes[i]["bg"]["value"], [...this.grid(boxes[i]["box"])])
				}
				else if (boxes[i]["bg"]["type"]=="gradient") { //color gradient
					this.gradient(boxes[i]["bg"]["value"], [...this.grid(boxes[i]["box"])])
				}
			else { //if bg isnt set, display white background
				this.rect("#fff", [...this.grid(boxes[i]["box"])])
			}
			this.text(boxes[i]) //adds basic text formatting
			}
		}
	}
	findall() { //finds all unique img urls and loads them
		for (var i of this.board["grids"]) {
			if (i["bg"]) {
				if (i["bg"]["type"]=="img") {
					if (!this.srcs.includes(i["bg"]["value"])) { //only appends url if its not there
						this.srcs.push(i["bg"]["value"])
					}
				}
			}
		}
	}
	cache(url) { //chaches single image
		return new Promise(function(resolve){
			var imgobj=new Image() //make a new img obj
			imgobj.onload=function(){ resolve(imgobj) } //and when it loads return it
			imgobj.src=url //sets src after to make sure onload is caught
		})
	}
	async cacheall() { //caches all imgs in this.srcs
		for (var i in this.srcs) {
			if (!this.imgs[i]) { //if not initialized
				this.imgs[i]=await this.cache(this.srcs[i]) //awaits for img to finish
				this.redrawall() //then redraw the screen
			}
		}
	}
	update() { //called when screen size changes
		this.screenx=window.innerWidth
		this.screeny=window.innerHeight
		
		this.sizex=this.screenx/this.board["x"] //size of each individual box in grid
		this.sizey=this.screeny/this.board["y"]
		
		var maxsize=this.sizey //makes canv height as long as it needs
		for (var i of this.board["grids"])
			if ((i["box"][1]+i["box"][3])*this.sizey>maxsize)
				maxsize=(i["box"][1]+i["box"][3])*this.sizey
				
		this.disp.canvas.width=this.screenx //resizes canvas
		this.disp.canvas.height=maxsize
	}
	refresh() { //updates, re-finds, re-caches, re-draws
		this.update()
		this.findall()
		this.cacheall()
		this.redrawall()
	}
	init() { //initializes the screen
		this.bg()
		this.refresh()
	}
	rect(color, box) { //draws box of certain color at given pos
		this.disp.fillStyle=color
		this.disp.fillRect(...box)
	}
	redraw(boxes) { //redraws all grids
		this.update()
		for(var i in boxes) { //for each box in the board:
			this.style([boxes[i]]) //draw outline
			this.text(boxes[i]) //render text
		}
	}
	redrawall() {
		this.redraw(this.board["grids"])
	}
	img(url, box) { //draws img and trim
		var imgobj=this.imgs[this.srcs.indexOf(url)] //based off of src find its respective img obj
		this.drawimg(imgobj, box)
	}
	drawimg(imgobj, box) {
		for (var w=0;w<=~~(box[2]/imgobj.width);w++) {
			for (var h=0;h<=~~(box[3]/imgobj.height);h++) {
				var tempx=Math.min(box[2]-(w*imgobj.width),imgobj.width)   //partialy fill img if it cant squeeze a full img near border
				var tempy=Math.min(box[3]-(h*imgobj.height),imgobj.height) //  so, if img is 16 px and only 2px are left, fill the 2px with a partial img
				if (tempx>0&&tempy>0) {
					this.disp.drawImage(imgobj,0,0, //start from 0,0 of source img
						tempx,tempy, //display the full img or however much is needed to fill border
						(w*imgobj.width)+box[0],(h*imgobj.height)+box[1],tempx,tempy) //display that to the screen in respective spot
				}
			}
		}
	}
	img64(str, box) { //loads a base64 img form string
		var imgobj=new Image()
		imgobj.src="data:image/png;base64,"+str
		this.drawimg(imgobj, box)
	}
	gradient(params, box) { //prints a gradient background
		params=params.split(" ") //splits the params into an array
		params[0]=params[0].toLowerCase() //converts the "X" or "Y" to lowercase

		//makes a new gradient pattern obj
		if (params[0]=="x") {
			var tempgradient=this.disp.createLinearGradient(box[0], box[1], box[0]+box[2], box[1]) //display left to right
		}
		else if (params[0]=="y") {
			var tempgradient=this.disp.createLinearGradient(box[0], box[1], box[0], box[1]+box[3]) //display top to bottom
		}
		params.shift(0) //removes the "x" or "y"
		for (var i in params) { //loop through all of the colors and add them to the gradient
			tempgradient.addColorStop(1/(params.length-1)*i,params[i]) //added current color and make sure it evenly takes up space
		}
		this.disp.fillStyle=tempgradient
		this.disp.fillRect(...box)
	}
	text(box) { //renders text at given pos
		var tempsize=48 //size used for positioning
		this.disp.font="48px monospace" //default font size and font face
		this.disp.fillStyle="black" //default color
		
		if (box["font"]) { //allow for font styling
			var tempfont=box["font"].split(" ")
			
			tempsize=Number(tempfont[0].replace(/[^0-9]/g,"")) //removes all non numeric values
			
			this.disp.font=tempfont[0]+" "+tempfont[1] //takes first 2 params as font size and font face
			this.disp.fillStyle=tempfont[2] //takes 3rd param as font color
		}
		if (box["text"]) { //makes sure there is text to print
			this.disp.fillText(box["text"], box["box"][0]*this.sizex, (box["box"][1]*this.sizey)+tempsize+2)
		}
	}
	action(str) { //runs JS code from string
		this.currentaction=new Function(str) //sets function as attribue so it has access to class
		return(this.currentaction())
	}
	clicked() { //finds out what grid was clicked based off mouse pos
		var tempx=~~(this.mousex/this.sizex) //finds what grid cordinates of the mouse are
		var tempy=~~(this.mousey/this.sizey) //
		var ret //returns the most recent board matching the cords

		//for (var i=0;i<this.board["board"].length;i++) {
		for (var i in this.board["grids"]) {
			//checks to see if the current mouse pos is within the current mouse grid
			if (tempx>=this.board["grids"][i]["box"][0]&&
				tempx<this.board["grids"][i]["box"][0]+this.board["grids"][i]["box"][2]&&
				tempy>=this.board["grids"][i]["box"][1]&&
				tempy<this.board["grids"][i]["box"][1]+this.board["grids"][i]["box"][3]) {
				if (!("ignore" in this.board["grids"][i])) { //if ignore flag is set then ignore this board
					ret=i //instead of getting first element that matches cords, get the last becase it is ontop of the others
					this.currentgridid=i
				}
			}
		}
		if (ret) {
			this.currentgrid=this.board["grids"][ret]
			return this.board["grids"][ret]
		}
		else {
			return false
		}
	}
	grid(box) { //returns cords for grid based on grid size and screen size
		return [box[0]*this.sizex,box[1]*this.sizey,box[2]*this.sizex,box[3]*this.sizey]
	}
	newimg(src, box) { //wrapper that handles new img srcs
		if (!this.srcs.includes(src)) {
			box["bg"]["value"]=src
			this.srcs.push(src)
						
			this.findall()
			this.cacheall()
			
			return box
		}
	}
}
