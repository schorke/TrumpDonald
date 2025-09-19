TRUMP.counter = (function(){
  var countNumber = 0,
      requestCount = 0;

  function initializePolling() {
    // Get initial counter value
    requestSend();
    
    // Set up regular polling for updates
    setInterval(function() {
      $.ajax({
        url: "/api/counter-stream",
        method: "GET"
      })
        .then(function(data) {
          if (data.counter !== undefined && data.counter !== countNumber) {
            countNumber = data.counter;
            setNumber();
          }
        })
        .fail(function(error) {
          console.error('Polling error:', error);
        });
    }, 3000); // Poll every 3 seconds
  }

  function requestSend(){
    $.ajax({
      url: "/api/counter",
      method: "GET"
    })
      .then(function(data) {
        requestCallback(data);
      },
      function() {
        if(requestCount < 100){
            setTimeout(requestSend, 5000);
        }
        requestCount++;
      });
  }
  
  function requestCallback(data) {
    if ( console && console.log ) {
      console.log( data);
    }
    countNumber = data.counter;
    if(data){
        setNumber();
        updateNumberTimeout();
        TweenMax.to([$(".counter-cont .counter-numbers"), $(".counter-cont .counter-text")], 0.5, {opacity:1});
    }
  }
  
  function setNumber(){
    $('.counter-numbers').html(countNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","))
  }
  
  function updateNumberClick(){
    // Optimistically update the display
    countNumber++;
    setNumber();
    
    // Send increment to server
    $.ajax({
      url: "/api/counter",
      method: "POST",
      contentType: "application/json"
    })
      .then(function(data) {
        if (data.counter !== undefined && data.counter !== countNumber) {
          // Sync with server if there's a discrepancy
          countNumber = data.counter;
          setNumber();
        }
      })
      .fail(function(error) {
        console.error('Failed to increment counter:', error);
        // Revert optimistic update on error
        countNumber--;
        setNumber();
      });
  }
  
  function updateNumberTimeout() {
    setTimeout(function(){
      requestSend();
    }, 60000)
  }

  // Initialize with polling
  initializePolling();
  
  return{
    uNC: updateNumberClick
  }
})();
