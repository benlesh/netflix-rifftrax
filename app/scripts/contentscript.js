var template = `<div id="nfrt">
  <button id="nfrt-showFind">RiffTrax</button>
  <div class="nfrt-dialog">
    <form name="findForm">
      <label for="audioFile">Locate RiffTrax Audio File:</label>
      <input type="file" name="audioFile" id="audioFile" required/>
      <div>
        <button class="nftr-load" type="submit">Load</button>
      </div>
    </form>
  </div>
</div>`;


var content = document.createElement('div');
content.innerHTML = template;
document.body.appendChild('content');