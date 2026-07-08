<template>
  <div class="wordmark">
    <div class="wordmark__badge">
      <div class="wordmark__badge-text">
        <span class="wordmark__badge-letter">P</span><span class="wordmark__badge-letter wordmark__badge-letter--accent">F</span><span class="wordmark__badge-letter">P</span>
      </div>
    </div>
    <div class="wordmark__text">Print <span class="wordmark__text--accent">Fab</span><br />Proxies</div>
  </div>
</template>

<style scoped>
.wordmark {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: "Inter", system-ui, sans-serif;
}

.wordmark__badge {
  width: 43px;
  height: 70px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background-color: #fffcfc;
  border: 1px solid #514d47;
}

.wordmark__badge-text {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.wordmark__badge-letter {
  color: #514d47;
  font-size: 18px;
}

.wordmark__badge-letter--accent {
  color: #b5451e;
}

.wordmark__text {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.05;
  text-align: left;
  font-variant: small-caps;
  color: #514d47;
  /* Keep "Print Fab" on one line (the explicit <br> still breaks before
     "Proxies"); otherwise the narrow sidebar wraps it awkwardly. */
  white-space: nowrap;
}

.wordmark__text--accent {
  font-weight: 900;
  color: #b5451e;
}
</style>
