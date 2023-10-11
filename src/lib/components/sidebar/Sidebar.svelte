<script>
    import collections from "$lib/assets/collections.svg";
    import mock from "$lib/assets/mock.svg";
    import environment from "$lib/assets/environment.svg";
    import apibuilder from "$lib/assets/api-builder.svg";
    import wiki from "$lib/assets/wiki.svg";
    import teams from "$lib/assets/teams.svg";
    import workspaces from "$lib/assets/workspaces.svg";
    import help from "$lib/assets/circle-question.svg";
    import { Link, navigate } from "svelte-navigator";
</script>

<div class="sidebar">
    <div class="sidebar__main">
        <Link style="text-decoration:none;" to="collections">
        <div class="sidebar__container">
            <div class="sidebar__container--icon"><img src={collections} alt="" /></div>
            <div class="sidebar__container--text"><p>Collections</p></div>
        </div>
        </Link>
        <Link style="text-decoration:none;" to="mock">
        <div class="sidebar__container">
            <div class="sidebar__container--icon"><img src={mock} alt="" /></div>
            <div class="sidebar__container--text"><p>Mock</p></div>
        </div></Link>
        <Link style="text-decoration:none;" to="environment">
        <div class="sidebar__container">
            <div class="sidebar__container--icon"><img src={environment} alt="" /></div>
            <div class="sidebar__container--text"><p>Environment</p></div>
        </div></Link>
        <Link style="text-decoration:none;" to="api-builder">
        <div class="sidebar__container" >
            <div class="sidebar__container--icon"><img src={apibuilder} alt="" /></div>
            <div class="sidebar__container--text"><p>API Builder</p></div>
        </div></Link>
        <Link style="text-decoration:none;" to="wiki">
        <div class="sidebar__container">
            <div class="sidebar__container--icon"><img src={wiki} alt="" /></div>
            <div class="sidebar__container--text"><p>Wiki</p></div>
        </div></Link>
        <Link style="text-decoration:none;" to="teams">
        <div class="sidebar__container">
            <div class="sidebar__container--icon"><img src={teams} alt="" /></div>
            <div class="sidebar__container--text"><p>Teams</p></div>
        </div></Link>
        <Link style="text-decoration:none;" to="workspaces">
        <div class="sidebar__container">
            <div class="sidebar__container--icon"><img src={workspaces} alt="" /></div>
            <div class="sidebar__container--text"><p>Workspaces</p></div>
        </div>
    </Link>
    </div>
    <div class="sidebar__help">
        <Link style="text-decoration:none;" to="help">
        <div class="sidebar__container">
            <div class="sidebar__container--icon"><img src={help} alt="" /></div>
            <div class="sidebar__container--text"><p>Help</p></div>
        </div>
        </Link>
    </div>

</div>
<style>
    .sidebar{
        height: 100vh;
        width: 72px;
        display: flex;
        flex-direction: column;
        padding: 12px 4px 12px 4px;
        border-right: 1px solid #313233;
        justify-content: space-between;
        position: fixed;
        top:0;
        left:0;
    }
    .sidebar__main{
        display: flex;
        flex-direction: column;
    }
    .sidebar__help{
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .sidebar__container{
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
    }
    .sidebar__container--icon img{
        height: 24px;
        width: 24px;
    }
    .sidebar__container--text{
        font-family: Roboto;
        font-size: 10px;
        font-weight: 400;
        line-height: 10px;
        letter-spacing: 0em;
        color: white;
        text-decoration:wavy;
    }
    
</style>