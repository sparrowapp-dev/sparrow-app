<script lang="ts">
  import { Router, Route } from "svelte-navigator";
  import "font-awesome/css/font-awesome.css";

  import Toast from "$lib/components/notifications/Toast.svelte";
  import LoginPage from "./pages/Auth/login-page/LoginPage.svelte";
  import RegisterPage from "./pages/Auth/register-page/RegisterPage.svelte";

  import Authguard from "./routing/Authguard.svelte";
  import Navigate from "./routing/Navigate.svelte";
  import Dashboard from "./pages/Dashboard/Dashboard.svelte";
  import UpdatePassword from "./pages/Auth/update-password/UpdatePassword.svelte";
  import ResetPassword from "./pages/Auth/reset-password/ResetPassword.svelte";
  import ForgotPassword from "./pages/Auth/forgot-password/ForgotPassword.svelte";
  import ResendEmail from "./pages/Auth/resend-email/ResendEmail.svelte";
  import HomePage from "./pages/Home/home-page/HomePage.svelte";

  export let url = "/";

  function handleContextMenu(event) {
    event.preventDefault();
  }

  function move(element) {
    return {
      destroy() {},
    };
  }

  function resize(element) {
    const right = document.createElement("div");
    right.direction = "east";
    right.classList.add("grabber");
    right.classList.add("right");

    const left = document.createElement("div");
    left.direction = "west";
    left.classList.add("grabber");
    left.classList.add("left");

    const top = document.createElement("div");
    top.direction = "north";
    top.classList.add("grabber");
    top.classList.add("top");

    const bottom = document.createElement("div");
    bottom.direction = "south";
    bottom.classList.add("grabber");
    bottom.classList.add("bottom");

    const topLeft = document.createElement("div");
    topLeft.direction = "northwest";
    topLeft.classList.add("grabber");
    topLeft.classList.add("top-left");

    const topRight = document.createElement("div");
    topRight.direction = "northeast";
    topRight.classList.add("grabber");
    topRight.classList.add("top-right");

    const bottomLeft = document.createElement("div");
    bottomLeft.direction = "southwest";
    bottomLeft.classList.add("grabber");
    bottomLeft.classList.add("bottom-left");

    const bottomRight = document.createElement("div");
    bottomRight.direction = "southeast";
    bottomRight.classList.add("grabber");
    bottomRight.classList.add("bottom-right");

    const grabbers = [
      right,
      left,
      top,
      bottom,
      topLeft,
      topRight,
      bottomLeft,
      bottomRight,
    ];

    let active = null,
      initialRect = null,
      initialPos = null;

    grabbers.forEach((grabber) => {
      element.appendChild(grabber);
      grabber.addEventListener("mousedown", onMousedown);
    });

    function onMousedown(event) {
      active = event.target;
      const rect = element.getBoundingClientRect();
      const parent = element.parentElement.getBoundingClientRect();

      console.log({ rect, parent });

      initialRect = {
        width: rect.width,
        height: rect.height,
        left: rect.left - parent.left,
        right: parent.right - rect.right,
        top: rect.top - parent.top,
        bottom: parent.bottom - rect.bottom,
      };
      initialPos = { x: event.pageX, y: event.pageY };
      active.classList.add("selected");
    }

    function onMouseup(event) {
      if (!active) return;

      active.classList.remove("selected");
      active = null;
      initialRect = null;
      initialPos = null;
    }

    function onMove(event) {
      if (!active) return;

      const direction = active.direction;
      let delta;

      if (direction.match("east")) {
        delta = event.pageX - initialPos.x;
        element.style.width = `${initialRect.width + delta}px`;
      }

      if (direction.match("west")) {
        delta = initialPos.x - event.pageX;
        element.style.left = `${initialRect.left - delta}px`;
        element.style.width = `${initialRect.width + delta}px`;
      }

      if (direction.match("north")) {
        delta = initialPos.y - event.pageY;
        element.style.top = `${initialRect.top - delta}px`;
        element.style.height = `${initialRect.height + delta}px`;
      }

      if (direction.match("south")) {
        delta = event.pageY - initialPos.y;
        element.style.height = `${initialRect.height + delta}px`;
      }
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onMouseup);

    return {
      destroy() {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mousemove", onMousedown);

        grabbers.forEach((grabber) => {
          element.removeChild(grabber);
        });
      },
    };
  }

  let grabber = true;
</script>

<div class="box" use:move use:resize>
  <Router {url}>
    <Authguard>
      <section
        slot="loggedIn"
        on:contextmenu={handleContextMenu}
        class="resizable"
      >
        <Route path="/home" component={HomePage} />
        <Route path="/dashboard/*" component={Dashboard} />
        <Route path="/*"><Navigate to="/dashboard" /></Route>
      </section>
      <section
        slot="unauthorized"
        on:contextmenu={handleContextMenu}
        class="resizable"
      >
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={RegisterPage} />
        <Route path="/forgot/password" component={ForgotPassword} />
        <Route path="/update/password" component={UpdatePassword} />
        <Route path="/reset/password" component={ResetPassword} />
        <Route path="/resend/email" component={ResendEmail} />
        <Route path="/*"><Navigate to="/login" /></Route>
      </section>
    </Authguard>
  </Router>
</div>

<Toast />

<style>
  .box {
    left: 300px;
    top: 100px;
    height: 100px;
    width: 100px;
    background: #e5e5e5;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    user-select: none;
  }

  :global(.grabber) {
    position: absolute;
    box-sizing: border-box;
  }

  :global(.grabber.right) {
    width: 10px;
    height: 100%;
    background: red;
    right: -5px;
    cursor: col-resize;
  }

  :global(.grabber.left) {
    width: 10px;
    height: 100%;
    background: blue;
    left: -5px;
    cursor: col-resize;
  }

  :global(.grabber.top) {
    height: 10px;
    width: 100%;
    background: green;
    top: -5px;
    cursor: row-resize;
  }

  :global(.grabber.bottom) {
    height: 10px;
    width: 100%;
    background: orange;
    bottom: -5px;
    cursor: row-resize;
  }

  :global(.grabber.top-left) {
    height: 20px;
    width: 20px;
    background: orange;
    top: -10px;
    left: -10px;
    cursor: nw-resize;
    border-radius: 100%;
  }

  :global(.grabber.top-right) {
    height: 20px;
    width: 20px;
    background: orange;
    top: -10px;
    right: -10px;
    cursor: ne-resize;
    border-radius: 100%;
  }

  :global(.grabber.bottom-left) {
    height: 20px;
    width: 20px;
    background: green;
    bottom: -10px;
    left: -10px;
    cursor: sw-resize;
    border-radius: 100%;
  }

  :global(.grabber.bottom-right) {
    height: 20px;
    width: 20px;
    background: green;
    bottom: -10px;
    right: -10px;
    cursor: se-resize;
    border-radius: 100%;
  }

  :global(.hide-grabber .grabber) {
    background: transparent !important;
    border: none !important;
  }

  :global(.grabber.selected) {
    border: solid 1px black;
  }

  header {
    text-align: center;
  }
  main {
    flex: 2;
    display: block;
    position: relative;
  }

  :global(body) {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
