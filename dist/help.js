'use strict';
// Guidance is separate from operational state. Taking the tour never edits returns.
const GUIDE_KEY='hpe-revolve-guide-v1';
const HELP={
 overview:['Start with the items that need attention','Active returns are unfinished items. Blocked returns have unresolved exceptions. Ready for handoff means an approved resale item can complete the simulated inventory update. Click any return ID to open its digital traveler.'],
 receiving:['Create a traveler in three steps','1. Use a sample document or upload your own. 2. Review the RMA, delivery reference, product, serial, and owner. 3. Check the review confirmation and create the traveler. Uploaded documents require manual entry; only the sample button fills known example fields.'],
 returns:['One digital traveler for each returned item','A traveler is the item’s shared work record: identity, stage, owner, decisions, issues, and history. Search or filter to find an item, then click its RV number. Work & decisions contains the action needed to reach the next stage.'],
 exceptions:['Blocked means an issue is still open','Missing authorization, mismatched identifiers, or damage can put an item on hold. Click Review, open the Exceptions tab, and enter a resolution note when the issue is addressed. All open exceptions must be resolved before the item can advance.'],
 insights:['Use counts to find where to investigate','These figures describe your current browser’s demo records. Stage counts show where unfinished items sit; aging highlights older returns. They do not prove a bottleneck or predict savings. Open a traveler to investigate the reason behind a delay.']
};
const TOUR=[
 {page:'overview',icon:'◫',title:'Welcome to ReVolve',lead:'Follow a returned item from arrival to its next destination.',body:'ReVolve connects receiving, inspection, disposition, and inventory handoff in one workflow. This short tour explains where to start and how to keep an item moving.',tip:'The tour only changes the page you are viewing. It does not create or update return records.'},
 {page:'overview',icon:'◎',title:'Find the next action',lead:'Your overview is the operations control tower.',body:'Use the four summary cards to see active, blocked, ready, and completed returns. Needs attention points to unresolved issues. Click a return ID in the workspace table to investigate an individual item.',tip:'Blocked means at least one exception is unresolved. An item can be unblocked and still need inspection or approval.'},
 {page:'receiving',icon:'↓',title:'Receive and review',lead:'Create a digital record when equipment arrives.',body:'Click Use a sample document to fill example fields, or upload a document and enter its fields manually. Review the item identifiers, choose an owner, and confirm your review before creating the digital traveler.',tip:'RMA is the return authorization reference. BOL is the delivery or bill-of-lading reference. The demo does not run OCR on uploaded files.'},
 {page:'returns',icon:'▤',title:'Open the digital traveler',lead:'The traveler is the history and work record for one item.',body:'Click an RV number. In Work & decisions, move the item to Inspection, save the inspection findings, then move to Disposition. Choose the outcome, explain your rationale, and record the demo supervisor approval.',tip:'If the next-stage button is disabled, check for open exceptions, a missing inspection, or an approval that has not been recorded.'},
 {page:'exceptions',icon:'⚑',title:'Resolve issues before advancing',lead:'An exception puts the item on hold until someone addresses it.',body:'Open an item from the exception queue and choose its Exceptions tab. Confirm the responsible owner, document what was checked or corrected in a resolution note, and click Resolve exception. Every open exception must be resolved.',tip:'To flag an issue, use Add exception inside a traveler. Selecting Damage found during inspection also creates an exception automatically.'},
 {page:'returns',icon:'✓',title:'Approve, hand off, and trace',lead:'Complete the outcome and preserve the evidence.',body:'For an approved Resale item, move to Resale inventory and choose Simulate inventory handoff & close. Other approved dispositions close with their recorded outcome. Event history shows the actions, notes, actor, and time.',tip:'Inventory updates are simulated. The prototype uses a fixed demo supervisor; it does not yet have individual sign-in or enforced roles.'},
 {page:'insights',icon:'↗',title:'You are ready to explore',lead:'Start with a sample return and follow its next action.',body:'Process insights summarizes current work and aging. Changes are saved in this browser, not shared across users. Reset demo data restores the original records after confirmation. Help & tour reopens this walkthrough anytime.',tip:'Try Receiving → Use a sample document → review the fields → Create digital traveler. If that serial already has an active return, open the existing traveler or use a different demo serial.'}
];
const helpButton=document.createElement('button');
helpButton.className='secondary help-trigger';helpButton.id='help-tour';helpButton.textContent='?  Help & tour';
document.querySelector('.header-right').prepend(helpButton);
const homeLink=document.createElement('a');homeLink.href='index.html';homeLink.className='link';homeLink.textContent='About ReVolve';document.querySelector('.header-right').prepend(homeLink);
const guide=document.createElement('dialog');guide.className='guide-dialog';guide.setAttribute('aria-labelledby','guide-title');guide.setAttribute('aria-describedby','guide-lead');document.body.append(guide);
let guideStep=0,guideOrigin='',guideFocus=null;
function addPageHelp(){
 const existing=document.querySelector('#page-help');if(existing)existing.remove();
 const [heading,body]=HELP[page]||HELP.overview;
 const box=document.createElement('details');box.id='page-help';box.className='page-help';
 box.innerHTML=`<summary><span class="help-mark">?</span><span>${heading}</span><span class="help-expand">How to use this page</span></summary><div class="help-body"><p>${body}</p><button class="link" type="button" data-start-guide>Take the guided tour →</button></div>`;
 const row=document.querySelector('#main .title-row');row?.after(box);
}
const originalRender=render;
render=function(){originalRender();addPageHelp()};
const originalDraw=drawRecord;
drawRecord=function(){originalDraw();const r=records.find(x=>x.id===selected);if(!r)return;
 const hint=document.createElement('div');hint.className='traveler-help';hint.setAttribute('role','note');
 const gate=openIssues(r).length?'On hold: resolve every open issue in Exceptions before advancing.':r.stage===1&&!r.inspected?'Next step: save inspection findings to enable Move to Disposition.':r.stage===2&&!r.approved?'Next step: select the disposition, enter a rationale, and record supervisor approval.':r.stage===4?'Completed: use Event history to review the recorded decisions and actions.':'Next step: use Work & decisions to review the record and move it to the next stage.';
 hint.innerHTML=`<strong>How to use this traveler</strong><p>${gate} The Exceptions tab tracks issues; Event history preserves the recorded actions.</p>`;
 document.querySelector('#drawer .detail-stages')?.after(hint);
};
function rememberGuide(){try{localStorage.setItem(GUIDE_KEY,'seen')}catch{}}
function displayGuide(){
 const s=TOUR[guideStep];
 history.replaceState(null,'','#'+s.page);render();window.scrollTo(0,0);
 guide.innerHTML=`<div class="guide-top"><span class="eyebrow">YOUR FIRST RETURN · ${guideStep+1} OF ${TOUR.length}</span><button type="button" class="close" id="guide-close" aria-label="Close tour">×</button></div><div class="guide-icon" aria-hidden="true">${s.icon}</div><h2 id="guide-title">${s.title}</h2><p id="guide-lead">${s.lead}</p><p class="guide-copy">${s.body}</p><div class="guide-tip"><strong>Good to know</strong><p>${s.tip}</p></div><div class="guide-progress" aria-label="Step ${guideStep+1} of ${TOUR.length}">${TOUR.map((_,i)=>`<i class="${i<=guideStep?'filled':''}"></i>`).join('')}</div><div class="guide-actions"><button type="button" class="link" id="guide-skip">${guideStep===TOUR.length-1?'Close guide':'Skip tour'}</button><div><button type="button" class="secondary" id="guide-back" ${guideStep===0?'disabled':''}>Back</button><button type="button" class="primary" id="guide-next">${guideStep===TOUR.length-1?'Try receiving →':'Next →'}</button></div></div>`;
 document.querySelector('#guide-close').onclick=()=>finishGuide();document.querySelector('#guide-skip').onclick=()=>finishGuide();
 document.querySelector('#guide-back').onclick=()=>{if(guideStep>0){guideStep--;displayGuide()}};
 document.querySelector('#guide-next').onclick=()=>{if(guideStep<TOUR.length-1){guideStep++;displayGuide()}else finishGuide('receiving')};
 document.querySelector('#guide-title').setAttribute('tabindex','-1');document.querySelector('#guide-title').focus();
}
function startGuide(){if(guide.open)return;guideFocus=document.activeElement;guideOrigin=location.hash||'#overview';closeRecord();guideStep=0;guide.showModal();displayGuide()}
function finishGuide(destination){rememberGuide();guide.close();history.replaceState(null,'',destination?'#'+destination:guideOrigin);render();window.scrollTo(0,0);if(guideFocus?.isConnected)guideFocus.focus();else helpButton.focus()}
guide.addEventListener('cancel',e=>{e.preventDefault();finishGuide()});
helpButton.onclick=startGuide;document.addEventListener('click',e=>{if(e.target.closest('[data-start-guide]'))startGuide()});
addPageHelp();
let seen=false;try{seen=localStorage.getItem(GUIDE_KEY)==='seen'}catch{}
if(!seen)startGuide();
