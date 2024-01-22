<script lang="ts">
    import { afterUpdate } from "svelte";
    export let onClick:(flag:boolean)=>void
    afterUpdate(()=>{
    const element=document.getElementById("progress-id");
    element.addEventListener("animationend",()=>{
      onClick(false);
    })
    })
  </script>
  
  <div
    class="background-overlay"
    on:click={() => {
      onClick(false);
    }}
  ></div>
  <div class="progress">
    <div class="container">
      <h1 class="syntax-highlighting">Fetching Data</h1>
      <div class="progress">
        <div class="progress-bar" id="progress-id" role="progressbar" style="width: 0%;" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
      </div>
    </div>
    </div>
  
  
  <style>
    .background-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: var(--background-color);
      z-index: 14;
    }
    .progress {
      position: fixed;
      width: 50%;
      height: 10%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 14;
      border-radius: 10px;
    }
  
    .container {
      display: flex;
      background-color: var(--background-color);
      justify-content: center;
    }
  
    .syntax-highlighting {
      font-family: Roboto;
      font-size: 12px;
      font-weight: 400;
      line-height: 18px;
      letter-spacing: 0em;
      text-align: left;
    }
    
    .progress-bar{
      animation: increaseWidth 1s forwards;
    }
  
     @keyframes increaseWidth {
      0% {
        width: 0%;
      }
      50%{
        width:50%
      }
      100% {
        width: 100%;
      } 
    } 
  </style>
  