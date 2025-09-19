TRUMP.counter = (function(){
  var countNumber = 0,
      requestCount = 0,
      eventSource = null,
      isConnected = false;

  function initializeStream() {
    if (eventSource) {
      eventSource.close();
    }
    
    try {
      eventSource = new EventSource('/api/counter-stream');
      
      eventSource.onopen = function() {
        isConnected = true;
        console.log('Counter stream connected');
      };
      
      eventSource.onmessage = function(event) {
        try {
          const data = JSON.parse(event.data);
          if (data.counter !== undefined) {
            countNumber = data.counter;
            setNumber();
            
            // Show counter on initial load
            if (data.type === 'initial') {
              TweenMax.to([$(".counter-cont .counter-numbers"), $(".counter-cont .counter-text")], 0.5, {opacity:1});
            }
          }
        } catch (error) {
          console.error('Error parsing stream data:', error);
        }
      };
      
      eventSource.onerror = function(error) {
        console.error('Counter stream error:', error);
        isConnected = false;
        
        // Fallback to polling if stream fails
        setTimeout(function() {
          if (!isConnected) {
            console.log('Falling back to polling');
            requestSend();
          }
        }, 5000);
      };
      
    } catch (error) {
      console.error('Failed to initialize stream:', error);
      // Fallback to polling
      requestSend();
    }
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
      .catch(function(error) {
        console.error('Failed to increment counter:', error);
        // Revert optimistic update on error
        countNumber--;
        setNumber();
      });
  }
  
  function updateNumberTimeout() {
    setTimeout(function(){
      if (!isConnected) {
        requestSend();
      }
    }, 60000)
  }

  // Initialize with stream, fallback to polling
  if (typeof EventSource !== 'undefined') {
    initializeStream();
  } else {
    console.log('EventSource not supported, using polling');
    requestSend();
  }
  
  return{
    uNC: updateNumberClick
  }
})();
