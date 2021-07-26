import Contract from './components/Contracts/contract.js'
import Rack from './components/Contracts/rack.js'
import Connex from '@vechain/connex'
import QRCode from 'qrcode'
//import QRCode from 'react-native-qrcode-svg';

function App() {
  //Fee Delegation Testing
  var feeDelegationAPI = 'ckquopd11017858epqqt2t4e0';
  //Company object
  var company = {};
  var customerDetails = {};
  var rackDetails = {};
  var deviceDetails = {};
  var deviceQueue = [];
  var numInQueue = 1;
  var reportDetails = {};

  //Password generator
  const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*_-+=";
  const characters = alpha + numbers + symbols;
  const _passwordLength = 10;

  //QRcode generator
  var QRCode = require('qrcode')

  //Transaction Type Constants
  const _txCompany = 1;
  const _txCustomer = 2;
  const _txRack = 3;
  const _txDevice = 4;
  const _txFile = 5;
  const _txPrice = 6;
  const _txOwner = 7;
  const _txWithdraw = 8;
  const _txReport = 9;
  

  //Connect to Vechain network
  const connex = new Connex({
    node: 'https://testnet.veblocks.net/',
    network: 'test'
    })

  return (
    <>
      <script type="text/javascript" src="../sjcl.js"></script>
      <h1>smartrack.io</h1>
        <br></br>
        <button id='createCompany' type='button' onClick={handleCreateCompany}>Create New Company</button>
        <br></br>
        <h2>--OR--</h2>
        <button type='button' onClick={handleConnectWallet}>Connect Wallet</button>
        <br></br>
        <h2>--Add Customer--</h2>
        Customer: <input type="text" name="customerName"/>
        <button type='button' onClick={handleCreateCustomer}>Create New Customer</button>
        <br></br>
        <form>
        <select name="Customers" id="customerList" size='3' onChange={handleCustomersRackLocations}>
        </select>
        </form>
        <br></br>
        <h2>--Add Rack--</h2>
        Rack: <input type="text" name="rackName"/>
        <button type='button' onClick={handleCreateRack}>Create New Rack</button>
        <br></br>
        <form>
        <select name="Racks" id="rackList" size='3' onClick={handleRackItems}>
        </select>
        </form>
        <br></br>
        <h2>--QR CODE--</h2>
        <canvas id="canvas"></canvas>
        <script src="bundle.js"></script>
        <br></br>
        <h4 id ="pinCode">''</h4>
        <br></br>
        <h2>--Add Device--</h2>
        Brand: <input type="text" name="itemBrand"/>
        <br></br>
        Model: <input type="text" name="itemModel"/>
        <br></br>
        Serial: <input type="text" name="itemSerial"/>
        <br></br>
        Mac: <input type="text" name="itemMac"/>
        <br></br>
        <form>
        <select name="deviceStatus">
        <option value="1">--OK--</option>
        <option value="0">--Failed--</option>
        <option value="2">--Repairing--</option>
        <option value="3">--Loan--</option>
        <option value="4">--Removed--</option>
        </select>
        </form>
        <button type='button' name='queueDevice' onClick={handleQueueDevice}>Queue Device (0)</button>
        <button type='button' onClick={handleCreateItem}>Send Devices to Blockchain</button>
        <button type='button' onClick={handleCreateItemDelegated}>Send Devices to Blockchain Delegated</button>
        <br></br>
        <h2>--Devices--</h2>
        <form>
        <select name="itemList" id="itemList" size='8' onChange={console.log('Click')}>
        </select>
        </form>
        <br></br>
        <h2>--Add Service Report--</h2>
        Name: <input type="text" name="reportName"/>
        <br></br>
        Report: <input type="text" name="reportDetails"/>
        <br></br>
        <button type='button' onClick={handleCreateReport}>Create New Report</button>
        <form>
        <select name="reportList" id="reportList" size='3' onChange={handleLoadReport}>
        </select>
        </form>
        <p id="reportDetails"></p>
        <h2>--Owner Functions--</h2>
        Company Cost: <input type="text" name="companyPrice"/>
        <button type='button' onClick={handleUpdateCompanyPrice}>Update Company Costs</button>
        <br></br>
        Customer Cost: <input type="text" name="customerPrice"/>
        <button type='button' onClick={handleUpdateCustomerPrice}>Update Customer Costs</button>
        <br></br>
        Rack Cost: <input type="text" name="rackPrice"/>
        <button type='button' onClick={handleUpdateRackPrice}>Update Rack Costs</button>
        <br></br>
        <button type='button' onClick={handleWithdrawMoney}>Withdraw Funds</button>
        <p>Click on the "Choose File" button to upload a file:</p>
          <input type="file" id="myFile" name="filename"/>
          <input type="submit" onClick={handleFileUpload}/>
        <br></br>
        <img id="testStar" alt="" src="n"></img>
        <button type="button" onClick={handleSeeFile}>Download File </button>
        <img id="testStar2" alt="" src="n"></img>
    </>
    
    
  )
//*********************** UI Functions ********************************/
 
//Generate QR code for rack url and display pincode
function generateQRCode(){
  const _customerSelect = document.getElementById("customerList").value;
  const _rackSelect = document.getElementById("rackList").value;
  const canvas = document.getElementById('canvas')
  const _pinCode = document.getElementById("pinCode");
  const _rackID = company.customer[_customerSelect].rack[_rackSelect].address;

  QRCode.toCanvas(canvas, 'https://www.smartrack.io/rack?id=' + _rackID, function (error) {
    if (error) console.error(error)
    console.log('QR Generated!');
  }) 
  _pinCode.innerHTML = company.customer[_customerSelect].rack[_rackSelect].pincode;
}

//Updates customer list in UI
function updateCustomerView(){
  console.log("Customer view updated!")
  const _customerSelect = document.getElementById("customerList");
  _customerSelect.options.length = 0;
  for (var i = 0; i < company.customerIndex; i++){
    _customerSelect.options[_customerSelect.options.length] = new Option(company.customer[i].name,
    company.customer[i].index);
  };
}

//Updates rack list in UI
function updateRackView(){
  console.log("Rack view updated!")
  const _customerSelect = document.getElementById("customerList").value;
  const _rackList = document.getElementById("rackList");
  _rackList.options.length = 0;
  for (var i = 0; i < company.customer[_customerSelect].rackIndex; i++){
    _rackList.options[_rackList.options.length] = new Option(company.customer[_customerSelect].rack[i].name, 
    company.customer[_customerSelect].rack[i].index);
  };
}

//Updates device list in UI
function updateDeviceView(){
  console.log("Device view updated!")
  const _customerSelect = document.getElementById("customerList").value;
  const _rackSelect = document.getElementById("rackList").value;
  const _itemList = document.getElementById("itemList");
  _itemList.options.length = 0;

  generateQRCode();

  for (var i = 0; i < company.customer[_customerSelect].rack[_rackSelect].item.length; i++){
    _itemList.options[_itemList.options.length] = new Option("Brand: " + company.customer[_customerSelect].rack[_rackSelect].item[i].brand + ", " +
    "Model: " + company.customer[_customerSelect].rack[_rackSelect].item[i].model + ", " +
    "Serial: " + company.customer[_customerSelect].rack[_rackSelect].item[i].serial + ", " +
    "Mac: " + company.customer[_customerSelect].rack[_rackSelect].item[i].mac, i);
  };
}

//Updates report list in UI
function updateReportView(){
  console.log("Report view updated!")
  const _customerSelect = document.getElementById("customerList").value;
  const _rackSelect = document.getElementById("rackList").value;
  const _reportList = document.getElementById("reportList");
  _reportList.options.length = 0;

  for (var i = 0; i < company.customer[_customerSelect].rack[_rackSelect].reportIndex; i++){
    _reportList.options[_reportList.options.length] = new Option(company.customer[_customerSelect].rack[_rackSelect].report[i].time, company.customer[_customerSelect].rack[_rackSelect].report[i].index);
  };
}

//Updates report details in UI
function handleLoadReport(){
  console.log("Load Report!")
  const _customerSelect = document.getElementById("customerList").value;
  const _rackSelect = document.getElementById("rackList").value;
  const _reportList = document.getElementById("reportList").value;
  const _reportDetails = document.getElementById("reportDetails");

  _reportDetails.innerText = "Report by: " + company.customer[_customerSelect].rack[_rackSelect].report[_reportList].name + "\n" + company.customer[_customerSelect].rack[_rackSelect].report[_reportList].details
}

//Generates Password for Rack Contract Encryption
function generatePassword(){
  let password = "";
  for (let i = 0; i < _passwordLength; i++) {
    password += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return password;
};

//Epoch Converter
//https://www.epochconverter.com/programming/#javascript
//https://stackoverflow.com/questions/44060804/convert-epoch-time-to-human-readable-with-specific-timezone
function convertTime(_epoch){
  var d = new Date(Number(_epoch) * 1000);
  return d.toLocaleString();
}

//*************** Connect to wallet for info *************************/
async function handleConnectWallet(){
  //request identification
  const certSigning = await connex.vendor.sign('cert',{
      purpose: 'identification',
      payload: {
          type: 'text',
          content: 'Sign the cert to confirm identitiy'
        }
    })
  .request()
  //stores public address
  company.address = certSigning.annex.signer
  //checks to see if a company has been created
  const data = await connex.thor.account(Contract.address).method(Contract.isCompanyCreated).caller(company.address).call();
  if(data.decoded._isItACompany){
    handleSeeMyCustomers();     
  }
  else{
    alert("Please create a company first!");
  };
  
};

//*************** WRITING FUNCTIONS *************************/


//Creates transaction clause
async function createClause(_to,_method,_value,...args){
  const _clause = (connex.thor.account(_to)
  .method(_method)
  .value(_value)
  .asClause(...args));
  return _clause;
}


//Requests signing of transaction
async function requestTransaction(_clauses,_txType=0, _delegate=""){
  if(_delegate !== "" && _txType === _txDevice){
    console.log("fee was delegated")
    _delegate = 'https://sponsor.vechain.energy/sign/'+_delegate;
    const signingService = await connex.vendor.sign('tx', _clauses)
    .delegate(_delegate)
    .request()
    console.log(signingService);
    return signingService;
  }
  else if(_delegate === "" && _txType === _txCompany){
    console.log("signer has paid fee")
    const signingService = await connex.vendor.sign('tx', _clauses)
    .request(); 
    console.log(signingService);
    return signingService;
  }
  else if(_delegate === "" && _txType === _txFile){
    console.log("signer has paid fee")
    
  }
  else{
    console.log("signer has paid fee")
    const signingService = await connex.vendor.sign('tx', _clauses)
    .signer(company.address)
    .request(); 
    console.log(signingService);
    return signingService;
  }
}


//Check blockchain for confirmation
async function waitForConfirmation(_txID,_txType){

  //Creates tranaction object
  const tx = connex.thor.transaction(_txID);
  var receipt = await tx.getReceipt()
  //Loop runs while transaction is confirming
  while(receipt == null){
    receipt = await tx.getReceipt()
  }
  //Failed errors
  if(receipt.reverted){
    if(_txType === _txCompany){
      alert("Company Creation Failed!")
    }
    else if(_txType === _txCustomer){
      alert("Customer Creation Failed!")
    }
    else if(_txType === _txRack){
      alert("Rack Creation Failed!")
    }
    else if(_txType === _txDevice){
      alert("Device Creation Failed!")
    }
    else if(_txType === _txFile){
      alert("Device Creation Failed!")
    }
    else if(_txType === _txPrice){
      alert("Price Update Failed!")
    }
    else if(_txType === _txOwner){
      alert("Owner Transfer Failed!")
    }
    else if(_txType === _txWithdraw){
      alert("Withdraw Failed!")
    }
    else if(_txType === _txReport){
      alert("Service Report Failed!")
    }
    else{
      alert("Unknown Transaction Failed!")
    }
  }
  //Successful
  else{
    if(_txType === _txCompany){
      alert("Company Created!")
    }
    else if(_txType === _txCustomer){
      handleSeeMyCustomers();
    }
    else if(_txType === _txRack){
      handleCustomersRackLocations();
    }
    else if(_txType === _txDevice){
      handleRackItems();
    }
    else if(_txType === _txFile){
      
    }
    else if(_txType === _txPrice){

    }
    else if(_txType === _txOwner){
      
    }
    else if(_txType === _txWithdraw){

    }
    else if(_txType === _txReport){
      handleServiceCalls();
    }
    else{
      alert("Unknown Transaction Successful!")
    }
  }
}


//Stacks device array for multi clause transaction
async function handleQueueDevice(){
  const _queueButton = document.getElementsByName("queueDevice");
  //Which customer
  const _customerSelect = document.getElementById("customerList").value;
  //Which rack
  const _rackSelect = document.getElementById("rackList").value;
  //Device values
  const _itemBrand = document.getElementsByName("itemBrand")[0].value;
  const _itemModel = document.getElementsByName("itemModel")[0].value;
  const _itemSerial = document.getElementsByName("itemSerial")[0].value;
  const _itemMac = document.getElementsByName("itemMac")[0].value;
  const _itemStatus = document.getElementsByName("deviceStatus")[0].value;
  //Check for null values
  if (_itemBrand === '' || _itemModel === '' || _itemSerial === '' || _itemMac === ''){
    alert("Please fill in detials!");
  }
  else if(!_rackSelect){
    alert("Please Select A Rack!");
  }
  else if(!_customerSelect){
    alert("Please Select A Rack!");
  }
  else{
    //Create clause object
    deviceQueue.push(await createClause(company.customer[_customerSelect].rack[_rackSelect].address,
    Rack.addDevice,
    '0',
    _itemBrand,
    _itemModel,
    _itemSerial,
    _itemMac,
    _itemStatus));
    numInQueue++;
    _queueButton.innerHTML = 'Queue Device (' + String(numInQueue) + ')';
    console.log(deviceQueue);
  }
}


//Create a company based on public wallet address
async function handleCreateCompany(){
  //Get current prices
  const data = await connex.thor.account(Contract.address)
  .method(Contract.viewPrices)
  .call();
  const _price = data.decoded._company
  //Create clause object
  const clause = [];
  clause.push(await createClause(Contract.address,
  Contract.createCompany,
  _price));
  //Request confirmation & write to blockchain
  const transactionResponse = await requestTransaction(clause,_txCompany);
  //Confirm blockchain transaction
  waitForConfirmation(transactionResponse.txid,_txCompany);
};


//Create a customer assocated to company's public wallet address
async function handleCreateCustomer(){
  //Name of customer
  const _customerName = document.getElementsByName("customerName")[0].value;
  //Check for null values
  if (_customerName === ''){
    alert("Please Name Customer!");
  }
  else{
    //Get current prices
    const data = await connex.thor.account(Contract.address)
    .method(Contract.viewPrices)
    .call();
    const _price = data.decoded._customer
    //Create clause object
    const clause = [];
    clause.push(await createClause(Contract.address,
    Contract.addCustomer,
    _price,
    _customerName));
    //Request confirmation & write to blockchain
    const transactionResponse = await requestTransaction(clause);
    //Confirm blockchain transaction
    waitForConfirmation(transactionResponse.txid,_txCustomer);
  };
};


//Creates a rack assocated with a customer's index number
async function handleCreateRack(){
  //Customer's index
  const _customerSelect = document.getElementById("customerList").value;
  //Name of rack
  const _rackName = document.getElementsByName("rackName")[0].value;
  //Check for null values
  if (_rackName === ''){
    alert("Please Name Rack!");
  }
  else if (!_customerSelect){
    alert("Please Select Customer!");
  }
  else{
    //Genrate pin for QR code
    const _pincode = generatePassword();
    //Get current prices
    const data = await connex.thor.account(Contract.address)
    .method(Contract.viewPrices)
    .call();
    const _price = data.decoded._rack
    //Create clause object
    const clause = [];
    clause.push(await createClause(Contract.address,
    Contract.addRack,
    _price,
    _customerSelect,
    _rackName,
    _pincode));
    //Request confirmation & write to blockchain
    const transactionResponse = await requestTransaction(clause);
    //Confirm blockchain transaction
    waitForConfirmation(transactionResponse.txid,_txRack);
  };
};


//Sends tx of device array to blockchain
async function handleCreateItem(){
  //Request confirmation & write to blockchain
  const transactionResponse = await requestTransaction(deviceQueue);
  //Confirm blockchain transaction
  waitForConfirmation(transactionResponse.txid,_txDevice);
  deviceQueue=[];
  numInQueue = 0;
};


//Sends tx of device array to blockchain
async function handleCreateItemDelegated(){
  //Request confirmation & write to blockchain
  const transactionResponse = await requestTransaction(deviceQueue,_txDevice,feeDelegationAPI);
  //Confirm blockchain transaction
  waitForConfirmation(transactionResponse.txid,_txDevice);
  deviceQueue=[];
  numInQueue = 0;
};


//Create Serivce Report
async function handleCreateReport(){
  console.log("Create new report!");
  //Which customer
  const _customerSelect = document.getElementById("customerList").value;
  //Which rack
  const _rackSelect = document.getElementById("rackList").value;
  //Report values
  const _reportName = document.getElementsByName("reportName")[0].value;
  const _reportDetails = document.getElementsByName("reportDetails")[0].value;
  if (_reportName === '' || _reportDetails === ''){
    alert("Please fill in report detials!");
  }
  else if(!_rackSelect){
    alert("Please Select A Rack!");
  }
  else if(!_customerSelect){
    alert("Please Select A Rack!");
  }
  else{
    //Create clause object
    const clause = [];
    clause.push(await createClause(company.customer[_customerSelect].rack[_rackSelect].address,
    Rack.addReport,
    '0',
    _reportName,
    _reportDetails));
    //Request confirmation & write to blockchain
    const transactionResponse = await requestTransaction(clause);
    //Confirm blockchain transaction
    waitForConfirmation(transactionResponse.txid,_txReport);
  }
}


//Upload File
async function handleFileUpload(){
  //Which customer
  const _customerSelect = document.getElementById("customerList").value;
  //Which rack
  const _rackSelect = document.getElementById("rackList").value;
  
  let file = document.getElementById("myFile").files[0];

  //Convert to Base 64
  const toBase64 = file => new Promise((resolve, reject) => {
    if(!file){
      console.log("empty file!")
      return;
    }
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
    });


  //Cut my life into pieces
  const createChunks = (file,cSize/* cSize should be byte 1024*1 = 1KB */) => {
    let startPointer = 0;
    let endPointer = file.size;
    let chunks = [];
    while(startPointer<endPointer){
     let newStartPointer = startPointer+cSize;
     chunks.push(file.slice(startPointer,newStartPointer));
     startPointer = newStartPointer;
    }
    return chunks;
   }

   let chunks = await createChunks(file,46000);
   var partOfFile = 0;
   var _dependsOn = null;
   while(chunks){
    console.log("partOfFile = " + partOfFile);
    console.log("Look at my chunks" + chunks);
    var encodedChunk = await toBase64(chunks.shift());
    if(chunks !== null){
      encodedChunk = encodedChunk.replace('==', '');
      encodedChunk = encodedChunk.replace('=', '');
    if(partOfFile !== 0){
      encodedChunk = encodedChunk.replace('data:application/octet-stream;base64,', '')
      }
    }
    console.log(encodedChunk);
    const clause = [];
    clause.push(await connex.thor.account(company.customer[_customerSelect].rack[_rackSelect].address)
    .method(Rack.addDocument)
    .asClause(partOfFile,partOfFile,encodedChunk));

    partOfFile++;

      if(_dependsOn){
        const signingService = await connex.vendor.sign('tx',clause)
          .dependsOn(_dependsOn)
          .request();
          console.log(signingService);
          _dependsOn = signingService.txid;
      }
      else{
        const signingService = await connex.vendor.sign('tx',clause)
          .request();
          console.log(signingService);
          _dependsOn = signingService.txid;
      }
   }
};

/******************* VEWING FUNCTIONS *******************/


//Calls customer names and indexs
async function handleSeeMyCustomers(){
  console.log("See My Customers!")
  //finds how many customers this company has added
  const data = await connex.thor.account(Contract.address)
  .method(Contract.seeCustomerIndex)
  .caller(company.address).call();
  company.customerIndex = data.decoded._customerIndex
  //Clear customer array
  company.customer = [];
  //Populate customer array
  for (var i = 0; i < company.customerIndex; i++){
    //Blockchain call
    const data = await connex.thor.account(Contract.address)
    .method(Contract.seeCustomerInfo)
    .caller(company.address).call(i);
    //Parse data
    customerDetails = {name:data.decoded._customerName,
    rackIndex:data.decoded._rackIndex,
    index:i};
    //Add to array
    company.customer[i] = customerDetails;
  };
  //Update UI
  updateCustomerView()
};


//Calls customer's rack locations
async function handleCustomersRackLocations(){
  console.log("See Rack Locations!")
  //Find the customer's index value
  const _customerSelect = document.getElementById("customerList").value;
  //Check for null values
  if (!_customerSelect){

  }
  else{
    //Get customer's rack index
    const data = await connex.thor.account(Contract.address)
    .method(Contract.seeCustomerInfo)
    .caller(company.address).call(_customerSelect)
    //Parse data
    company.customer[_customerSelect].rackIndex = data.decoded._rackIndex;
    //Clear rack array
    company.customer[_customerSelect].rack = [];
    //Pupulate array
    for (var i = 0; i < company.customer[_customerSelect].rackIndex; i++){
      //Call blockchain
      const data = await connex.thor.account(Contract.address)
      .method(Contract.seeRackLocation)
      .caller(company.address)
      .call(company.customer[_customerSelect].index,i);
      //Parse data
      rackDetails = {name:data.decoded._rackName,
      address:data.decoded._rackAddress,
      pincode:data.decoded._pincode,
      index:i};
      //Add to array
      company.customer[_customerSelect].rack[i] = rackDetails;
    };
    //Update UI
    updateRackView();
  };
};


//calls selected customer's selected rack's devices
async function handleRackItems(){
  console.log("See Rack Items!")
  //Find the customer and rack values
  const _customerSelect = document.getElementById("customerList").value;
  const _rackSelect = document.getElementById("rackList").value;
  //Check for null values
  if (!_customerSelect || !_rackSelect){

  }
  else{
    //Call blockchain
    const data = await connex.thor.account(company.customer[_customerSelect].rack[_rackSelect].address)
    .method(Rack.seeDeviceLoop)
    .call();
    //Clear rack's device array
    company.customer[_customerSelect].rack[_rackSelect].item = [];
    //Parse data
    for (var i = 0; i < data.decoded._brand.length; i++){
    deviceDetails = {brand:data.decoded._brand[i],
    model:data.decoded._model[i],
    serial:data.decoded._serial[i],
    mac:data.decoded._mac[i],
    state:data.decoded._state[0], 
    index:i};
    //Add to array
    company.customer[_customerSelect].rack[_rackSelect].item[i] = deviceDetails;
    };
    //Update UI
    updateDeviceView();
    handleServiceCalls();
  };
};


//calls selected customer's selected rack's service reports
async function handleServiceCalls(){
  console.log("See Service Calls!")
  //Find the customer and rack values
  const _customerSelect = document.getElementById("customerList").value;
  const _rackSelect = document.getElementById("rackList").value;
  //Check for null values
  if (!_customerSelect || !_rackSelect){

  }
  else{
    //Get number of service reports
    const data = await connex.thor.account(company.customer[_customerSelect].rack[_rackSelect].address)
    .method(Rack.howManyReports)
    .call();
    //Sets number of service reports
    company.customer[_customerSelect].rack[_rackSelect].reportIndex = data.decoded._reports;
    //Clear report array
    company.customer[_customerSelect].rack[_rackSelect].report = [];
    //Populate array
    for (var i = 0; i < company.customer[_customerSelect].rack[_rackSelect].reportIndex; i++){
      //Call blockchain
      const data = await connex.thor.account(company.customer[_customerSelect].rack[_rackSelect].address)
      .method(Rack.seeReport)
      .call(i);
      //Parse data
      reportDetails = {time:convertTime(data.decoded._time),
      name:data.decoded._name,
      details:data.decoded._report,
      index:i};
      //Add to array
      company.customer[_customerSelect].rack[_rackSelect].report[i] = reportDetails;
    };
    //Update UI
    updateReportView();
  };
};


//See uploaded file
async function handleSeeFile(){
  var _document = ''
  const _customerSelect = document.getElementById("customerList").value;
  const _rackSelect = document.getElementById("rackList").value;
  const data = await connex.thor.account(company.customer[_customerSelect].rack[_rackSelect].address)
    .method(Rack.documentSize)
    .call();
  console.log(data);
  //Sets number of service reports
  company.customer[_customerSelect].rack[_rackSelect].documentSize = data.decoded._sizeOfDocument;
    
    for (var i = 0; i <= company.customer[_customerSelect].rack[_rackSelect].documentSize; i++){
      //Call blockchain
      const data = await connex.thor.account(company.customer[_customerSelect].rack[_rackSelect].address)
      .method(Rack.seeDocument)
      .call(i);
      //Parse data
      _document += data.decoded._document
    };
  console.log(_document);
  document.getElementById('testStar2').src = _document;
};

/****************** LISTENER FUNCTIONS ******************/



/******************* OWNER FUNCTIONS *******************/

//Updates cost to create a company
async function handleUpdateCompanyPrice(){
  //Get new price
  const _newCompanyPrice = document.getElementsByName("companyPrice")[0].value;
  //Create clause object
  const clause = [];
  clause.push(await connex.thor.account(Contract.address)
  .method(Contract.updateCompanyPrice)
  .asClause(_newCompanyPrice));
  //Request confirmation & write to blockchain
  const transactionResponse = await requestTransaction(clause);
  //Confirm blockchain transaction
  waitForConfirmation(transactionResponse.txid,_txPrice);
};


//Updates cost to add a customer
async function handleUpdateCustomerPrice(){
  //Get new price
  const _newCustomerPrice = document.getElementsByName("customerPrice")[0].value;
  //Create clause object
  const clause = [];
  clause.push(await connex.thor.account(Contract.address)
  .method(Contract.updateCompanyPrice)
  .asClause(_newCustomerPrice));
  //Request confirmation & write to blockchain
  const transactionResponse = await requestTransaction(clause);
  //Confirm blockchain transaction
  waitForConfirmation(transactionResponse.txid,_txPrice);
};


//Updates cost to add a rack
async function handleUpdateRackPrice(){
  //Get new price
  const _newRackPrice = document.getElementsByName("rackPrice")[0].value;
  //Create clause object
  const clause = [];
  clause.push(await connex.thor.account(Contract.address)
  .method(Contract.updateCompanyPrice)
  .asClause(_newRackPrice));
  //Request confirmation & write to blockchain
  const transactionResponse = await requestTransaction(clause);
  //Confirm blockchain transaction
  waitForConfirmation(transactionResponse.txid,_txPrice);
};


//Withdraw money to contract owner
async function handleWithdrawMoney(){
  //Create clause object
  const clause = [];
  clause.push(await connex.thor.account(Contract.address)
  .method(Contract.withdrawMoney)
  .asClause());
  //Request confirmation & write to blockchain
  const transactionResponse = await requestTransaction(clause);
  //Confirm blockchain transaction
  waitForConfirmation(transactionResponse.txid,_txOwner);
};


}


export default App;
