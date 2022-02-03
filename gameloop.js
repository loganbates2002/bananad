class GameLoop {

  constructor() {
      this.c = null;
      this.canvas = null;
  }

  initializeCanvas() {
      this.canvas = document.getElementById('canvas');
      this.c = this.canvas.getContext('2d');
      document.body.style.margin = 0;
      document.body.style.padding = 0;
      this.onresize();
  }

  onresize() {
      if ( this.canvas ) {
          this.canvas.width = window.innerWidth;
          this.canvas.height = window.innerHeight;
      }
  }

  start() {
      this.toggleScreen('start-screen',false);
      this.toggleScreen('canvas',true);
      this.initializeCanvas();
  }

  toggleScreen(id,toggle) {
      let element = document.getElementById(id);
      let display = ( toggle ) ? 'block' : 'none';
      element.style.display = display;
  }
}