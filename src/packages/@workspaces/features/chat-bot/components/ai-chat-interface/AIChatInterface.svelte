<script>
  import { SparrowAIIcon } from "@library/icons";
</script>

<div class="container">
  <div class="chat-header">
    <SparrowAIIcon />
    <span class="gradient-text">SparrowAI</span>
  </div>
</div>

<style>
  .container {
    width: 320px;
    height: 580px;
    background-color: var(--bg-tertiary-750);
    border: 0.5px solid #5751fd;
    padding: 10px 8px 10px 8px;
    border-radius: 10px;
    margin-bottom: 8px;
  }
  .chat-header {
    display: flex;
  }
  .gradient-text {
    background: linear-gradient(to right, #158ff1, #5751fd);
    -webkit-background-clip: text;
    color: transparent;
    font-size: 16px;
    font-weight: 600;
    padding-left: 8px;
  }
</style>
