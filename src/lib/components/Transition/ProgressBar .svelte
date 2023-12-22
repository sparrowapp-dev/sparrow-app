<script>
  //   var i = 0;
  //   function move() {
  //     if (i == 0) {
  //       i = 1;
  //       var elem = document.getElementById("myBar");
  //       var width = 1;
  //       var id = setInterval(frame, 10);
  //       function frame() {
  //         if (width >= 100) {
  //           clearInterval(id);
  //           i = 0;
  //         } else {
  //           width++;
  //           elem.style.width = width + "%";
  //         }
  //       }
  //     }
  //   }
</script>

<div class="progress">
  <div
    class="progress-bar"
    role="progressbar"
    style="width: 25%"
    aria-valuenow="25"
    aria-valuemin="0"
    aria-valuemax="100"
    id="myBar"
  ></div>
</div>

<style>
  .progress {
    /* position: fixed; */
    width: 100vw;
    /* height: calc(100vh - 44px);
    left: 0;
    top: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 99999;
    background-color: var(--background-color); */
  }

  #myBar {
    width: 1%;
    height: 30px;
    background-color: #04aa6d;
  }
</style>
