/* Edifício Vértice: modelo visual de apresentação. Valores de engenharia não confirmados não são calculados. */
(() => {
  const floors = [
    {id:1,label:'1º pavimento',use:'Recepção · coworking',area:'585 m²',mapped:'405,04 m²',rooms:'20 salas de coworking',panel:'QD-P01',notes:'Sala de reunião, recepção, copa e QGBT indicados no quadro de áreas.'},
    {id:2,label:'2º pavimento',use:'Escritórios compactos',area:'585 m²',mapped:'403,76 m²',rooms:'Unidades comerciais',panel:'QD-P02',notes:'A planilha diverge na quantidade (40 ou 42 unidades); conferir planta.'},
    {id:3,label:'3º pavimento',use:'10 lofts',area:'585 m²',mapped:'433,55 m²',rooms:'10 lofts · 35 m² de rótulo cada',panel:'QD-P03',notes:'Dimensões internas estimadas por proporção (±10%); conferir rótulo da copa/lavanderia.'},
    {id:4,label:'4º pavimento',use:'Studios · lounge',area:'585 m²',mapped:'432,74 m²',rooms:'5 studios · lounge comum',panel:'QD-P04',notes:'Studios e lounge foram mapeados por proporção da planta (±10%).'},
    {id:5,label:'Cobertura',use:'Solar · infraestrutura',area:'150 m² terraço*',mapped:'254,86 m²',rooms:'54 módulos FV · jardim · técnica',panel:'QD-COB',notes:'Laje representada em 32,50 × 18,00 m; terraço branco de 150 m² inclui núcleo técnico.'}
  ];
  const state={floor:null,scenario:'normal',architecture:true,energy:true,protection:true,top:false,orbit:{theta:.72,phi:1.08,r:62},pointer:null};
  const el=(id)=>document.getElementById(id);
  const floorsHost=el('floorList');
  floors.forEach(f=>{const b=document.createElement('button');b.className='floor-btn';b.dataset.floor=f.id;b.innerHTML=`<span><b>${f.label}</b><small>${f.use}</small></span><span class="floor-num">0${f.id}</span>`;b.onclick=()=>selectFloor(f.id);floorsHost.appendChild(b);});
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x0a1725);scene.fog=new THREE.Fog(0x0a1725,65,125);
  const camera=new THREE.PerspectiveCamera(38,1,.1,220);
  const renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=false;el('viewport').appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xbcd8ea,0x1a2635,2.0));const key=new THREE.DirectionalLight(0xc8e6ff,2.1);key.position.set(-18,30,15);scene.add(key);const rim=new THREE.DirectionalLight(0x48d7cc,1.0);rim.position.set(20,14,-22);scene.add(rim);
  const mat=(color,roughness=.85,metalness=.05,transparent=false,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness,metalness,transparent,opacity,depthWrite:!transparent,side:THREE.DoubleSide});
  const mats={slab:mat(0x7f929f),glass:mat(0x56a9ba,.28,.25,true,.24),wall:mat(0x9eacb2,.8,0,true,.36),core:mat(0x596c79,.9),room:mat(0x294257,.9,0,true,.54),ground:mat(0x182b3a),cab:mat(0x22394b,.54,.22),cabDoor:mat(0x314b5d,.45,.2),accent:mat(0x9ade43,.4,.1),copper:mat(0xe5a746,.35,.4),cyan:mat(0x47d4d3,.35,.1),gen:mat(0x4b6273,.65,.25),pv:mat(0x174768,.32,.3),plant:mat(0x48744b,.9),white:mat(0xdce6eb,.7)};
  const building=new THREE.Group();scene.add(building);const architectureGroup=new THREE.Group();building.add(architectureGroup);const equipmentGroup=new THREE.Group();scene.add(equipmentGroup);const pathGroup=new THREE.Group();scene.add(pathGroup);const markers=[];const clickable=[];const floorGroups=[];
  function box(parent,x,y,z,w,h,d,material,name,clickFloor){const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);o.position.set(x,y,z);if(name)o.userData.name=name;if(clickFloor)o.userData.floor=clickFloor;parent.add(o);if(clickFloor)clickable.push(o);return o;}
  function line(parent,pts,color,width=1){const g=new THREE.BufferGeometry().setFromPoints(pts.map(p=>new THREE.Vector3(...p)));const l=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:.9,linewidth:width}));parent.add(l);return l;}
  function label(parent,text,x,y,z,color='#c8d8e2',scale=1){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='rgba(7,16,26,.88)';ctx.strokeStyle='rgba(92,125,148,.8)';ctx.lineWidth=3;ctx.roundRect(3,3,506,122,13);ctx.fill();ctx.stroke();ctx.font='600 34px Arial';ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64,480);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,depthTest:false}));s.position.set(x,y,z);s.scale.set(4.4*scale,1.1*scale,1);parent.add(s);return s;}
  // Laje e fachadas transparentes: a cota 32,50 × 18,00 m vem das plantas fornecidas.
  box(architectureGroup,0,-.6,0,38,.4,48,mat(0x0c1722)).receiveShadow=false;
  const floorY=[0,3.4,6.8,10.2,13.6];
  floors.forEach((f,i)=>{
    const group=new THREE.Group();group.userData.floor=f.id;architectureGroup.add(group);floorGroups.push(group);const y=floorY[i];
    box(group,0,y,0,18,.32,32.5,mats.slab,`${f.label} · laje`,f.id);
    // Enclosure and glass facade; a front cutaway keeps the internal arrangement visible.
    box(group,0,y+1.55,-16.1,18,.14,.16,mats.glass,null,f.id);box(group,-8.95,y+1.55,0,.14,3.1,32.2,mats.glass,null,f.id);box(group,8.95,y+1.55,0,.14,3.1,32.2,mats.glass,null,f.id);box(group,0,y+1.55,16.1,18,.14,.16,mats.glass,null,f.id);
    // Repeated central core is schematic; exact positions/clearances require CAD confirmation.
    box(group,0,y+.68,1,6.0,1.05,8.0,mats.core,'Núcleo comum esquemático',f.id);
    box(group,-1.65,y+1.25,1,2.45,1.55,1.8,mats.cabDoor,'Elevador A',f.id);box(group,1.2,y+1.25,1,2.35,1.55,1.8,mats.cabDoor,'Elevador B',f.id);
    box(group,0,y+1.2,4.4,2.5,1.5,2.25,mats.wall,'Escada',f.id);
    const roomMat=mats.room;
    if(i===0){
      // Reception plus small work rooms, indicating use rather than a surveyed partition plan.
      for(let r=0;r<2;r++)for(let c=0;c<5;c++){let x=-7.2+c*2.85,z=-10+r*5.0;box(group,x,y+.35,z,2.45,.55,3.4,roomMat,'Sala de coworking',f.id);}
      box(group,0,y+.26,-3.7,8.8,.15,4.7,mat(0x38705f,.9,0,true,.52),'Recepção · área aberta',f.id);
      box(group,-6.8,y+.42,7.5,3.5,.6,3.6,mats.room,'Sala de reunião',f.id);
      box(group,6.6,y+.45,7.4,3.4,.72,3.3,mats.cab,'QGBT · sala indicada na planta',f.id);
    }else if(i===1){
      for(let r=0;r<2;r++)for(let c=0;c<7;c++){let x=-7.5+c*2.25,z=-10+r*5.1;box(group,x,y+.3,z,1.9,.48,3.6,roomMat,'Unidade de escritório',f.id);}
      box(group,-6.2,y+.42,8.0,4.0,.65,3.2,mats.room,'Medição mestra / copa',f.id);
    }else if(i===2){
      for(let c=0;c<5;c++){box(group,-6.6+c*3.3,y+.38,-9,2.8,.65,6.1,roomMat,`Loft ${String(c+1).padStart(2,'0')}`,f.id);box(group,-6.6+c*3.3,y+.38,9,2.8,.65,6.1,roomMat,`Loft ${String(c+6).padStart(2,'0')}`,f.id);}
      box(group,0,y+.26,0,10,.12,7,mats.ground,'Hall de entrada',f.id);
    }else if(i===3){
      for(let c=0;c<5;c++)box(group,-6.7+c*3.35,y+.4,-8.8,2.8,.68,5.8,roomMat,`Studio ${String(c+1).padStart(2,'0')}`,f.id);
      box(group,0,y+.27,-.2,15,.14,8.2,mat(0x345e55,.9,0,true,.58),'Lounge · convivência',f.id);
    }else{
      // PV groups count 54 modules (1.0 × 1.9 m each) per the area workbook.
      let n=0;const starts=[[-6.7,-11.5],[-.6,-11.5],[5.5,-11.5],[-6.7,6.4],[-.6,6.4],[5.5,6.4]];
      starts.forEach(([sx,sz],gi)=>{const count=gi===0?10:gi<4?12:4;for(let p=0;p<count;p++){if(n>=54)return;const col=p%6,row=Math.floor(p/6);box(group,sx+col*.93,y+.62,sz+row*1.0,.82,.09,.91,mats.pv,'Módulo fotovoltaico');n++;}});
      box(group,0,y+.25,0,18,.12,7.8,mat(0x38584e,.9,0,true,.5),'Terraço · área informativa de 150 m²');
      [[-7,2],[7,2],[-5,12],[5,12]].forEach(([x,z])=>box(group,x,y+.42,z,3.1,.45,2.5,mats.plant,'Jardim / canteiro'));
      box(group,6.7,y+2.05,3,2.4,4,2.4,mats.core,'Torre de reservatório · base 3 × 3 m · H 4 m');
    }
    // QD cabinets, illustrative location near the vertical service core.
    const cab=box(group,4.0,y+.85,1.1,.85,1.45,.48,mats.cab, f.panel,f.id);box(group,4.0,y+.85,.84,.62,1.22,.06,mats.cabDoor, f.panel,f.id);
    label(group,f.panel,4.1,y+1.85,1.1,'#9ade43',.62);
    if(i===0)label(group,'QGBT',6.4,y+1.45,7.4,'#f4b44a',.7);
  });
  // External plant room and source equipment are intentionally marked as schematic.
  const ext=new THREE.Group();equipmentGroup.add(ext);
  box(ext,13,2.4,2,7,.16,10,mats.ground,'Sala técnica · localização esquemática');
  box(ext,13,3.55,-1,3.2,2.2,2.6,mats.gen,'Grupo gerador · potência a definir');
  box(ext,10.5,3.55,4,1.5,2.2,1.4,mats.cab,'ATS / QTA');
  box(ext,13,3.55,5.3,1.7,2.2,1.6,mats.cab,'UPS · 30–40 kVA indicados');
  box(ext,15.5,3.55,4,1.6,2.2,1.4,mats.cab,'QDE');
  box(ext,15.5,3.55,6.1,1.6,2.2,1.4,mats.cab,'QD-UPS');
  label(ext,'GERADOR · OPCIONAL',13,5.2,-1,'#b8c8d4',.66);label(ext,'ATS / QTA',10.5,5.2,4,'#f4b44a',.62);label(ext,'UPS',13,5.2,5.3,'#47d4d3',.62);
  // Main riser and conceptual source paths.
  const riserX=4.0,riserZ=1.1;
  const riserLine=line(pathGroup,[[riserX,.5,riserZ],[riserX,14.4,riserZ]],0x47d4d3,1);
  const generatorLine=line(pathGroup,[[13,3.6,4],[riserX,3.6,riserZ]],0xe5a746,1);
  const utilityLine=line(pathGroup,[[-12,1,7.4],[6.6,1,7.4]],0x9ade43,1);
  const branchLines=[],circuitLines=[];
  for(let i=0;i<5;i++){
    const yy=floorY[i]+.35;branchLines.push(line(pathGroup,[[riserX,yy,riserZ],[4.8,yy,riserZ],[5.5,yy,riserZ]],0x47d4d3,1));
    // Schematic outgoing circuit routes; destination and cable routing are not design data.
    circuitLines.push(line(pathGroup,[[5.5,yy,riserZ],[7.4,yy,1.1],[7.4,yy,-10.8]],0x47d4d3,1));
    circuitLines.push(line(pathGroup,[[5.5,yy,riserZ],[7.1,yy,1.1],[7.1,yy,12.4]],0x47d4d3,1));
  }
  const gridMarker=box(pathGroup,-12,1,7.4,.45,.45,.45,mats.accent,'Concessionária · fonte normal');markers.push(gridMarker);
  const sourceDot=new THREE.Mesh(new THREE.SphereGeometry(.19,8,6),mat(0x65f2ed,.3,.1));pathGroup.add(sourceDot);markers.push(sourceDot);
  const flowDots=[];for(let i=0;i<12;i++){const d=new THREE.Mesh(new THREE.SphereGeometry(.12,6,5),mat(0x70f8e7,.3));pathGroup.add(d);flowDots.push(d);}
  const dpsFlash=new THREE.Mesh(new THREE.SphereGeometry(.65,10,7),new THREE.MeshBasicMaterial({color:0xf4b44a,transparent:true,opacity:.6}));dpsFlash.position.set(6.5,1.2,7.3);equipmentGroup.add(dpsFlash);dpsFlash.visible=false;
  const gridLabel=label(scene,'REDE NORMAL',-12,2.0,7.4,'#9ade43',.78);
  // Ground plane and subtle grid.
  const ground=new THREE.GridHelper(90,30,0x274155,0x172a3a);ground.position.y=-.42;scene.add(ground);
  const target=new THREE.Vector3(0,7,0);
  function applyCamera(){const o=state.orbit;camera.position.set(target.x+o.r*Math.sin(o.phi)*Math.sin(o.theta),target.y+o.r*Math.cos(o.phi),target.z+o.r*Math.sin(o.phi)*Math.cos(o.theta));camera.lookAt(target);}
  function resize(){const r=el('viewport').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe(el('viewport'));resize();applyCamera();
  // Simple orbit/pan/zoom controls avoid a heavier interaction dependency.
  const ray=new THREE.Raycaster(),mouse=new THREE.Vector2();let dragging=false,last={x:0,y:0},didMove=0;
  renderer.domElement.addEventListener('pointerdown',e=>{dragging=true;didMove=0;last={x:e.clientX,y:e.clientY};renderer.domElement.setPointerCapture(e.pointerId);});
  renderer.domElement.addEventListener('pointermove',e=>{if(!dragging)return;const dx=e.clientX-last.x,dy=e.clientY-last.y;didMove+=Math.abs(dx)+Math.abs(dy);last={x:e.clientX,y:e.clientY};state.orbit.theta-=dx*.006;state.orbit.phi=Math.max(.22,Math.min(1.52,state.orbit.phi+dy*.005));applyCamera();});
  renderer.domElement.addEventListener('pointerup',e=>{dragging=false;if(didMove>5)return;const r=renderer.domElement.getBoundingClientRect();mouse.set(((e.clientX-r.left)/r.width)*2-1,-((e.clientY-r.top)/r.height)*2+1);ray.setFromCamera(mouse,camera);const hits=ray.intersectObjects(clickable,false);if(hits.length&&hits[0].object.userData.floor)selectFloor(hits[0].object.userData.floor);});
  renderer.domElement.addEventListener('wheel',e=>{state.orbit.r=Math.max(31,Math.min(90,state.orbit.r+e.deltaY*.035));applyCamera();},{passive:true});
  function setFloorVisibility(){floorGroups.forEach(g=>{g.visible=state.architecture&&(!state.floor||g.userData.floor===state.floor);});document.querySelectorAll('.floor-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.floor)===state.floor));}
  function selectFloor(id){state.floor=state.floor===id?null:id;setFloorVisibility();const f=floors.find(x=>x.id===state.floor);el('viewLabel').textContent=state.floor?`${f.label.toUpperCase()} · ISOLADO`:'VISTA GERAL · 5 NÍVEIS';el('floorTooltip').textContent=f?`${f.label} · ${f.use} · ${f.area} de área bruta`:'Selecione um pavimento para ver seus dados.';renderInspector();}
  function metric(label,value,small=''){return `<div class="metric"><span>${label}</span><b>${value}</b>${small?`<small>${small}</small>`:''}</div>`;}
  function row(a,b){return `<div class="data-row"><span>${a}</span><span>${b}</span></div>`;}
  function renderPath(){let labels=['Concessionária / entrada','QGBT · distribuição geral','Alimentadores / prumada','Quadros setoriais','Cargas do edifício'];if(state.scenario==='outage')labels=['Grupo gerador','ATS / QTA · transferência','QDE · cargas essenciais','UPS · continuidade','QD-UPS · cargas ininterruptas'];if(state.scenario==='branch')labels=['Concessionária / entrada','QGBT · distribuição geral','QD-P03 · proteção setorial','Circuito com falha isolado','Demais pavimentos ativos'];if(state.scenario==='surge')labels=['Concessionária / entrada','QGBT · proteção a montante','DPS · resposta conceitual','Circuitos preservados','Supervisão / alarme'];const active=state.scenario==='branch'?2:state.scenario==='surge'?2:state.scenario==='outage'?1:4;el('pathList').innerHTML=labels.map((x,i)=>`<div class="path-item ${i<=active?'active':''}"><span class="path-node">${String(i+1).padStart(2,'0')}</span>${x}</div>${i<labels.length-1?'<div class="path-connector"></div>':''}`).join('');}
  function renderInspector(){const f=state.floor?floors.find(x=>x.id===state.floor):null;const outage=state.scenario==='outage';el('inspectTitle').textContent=f?f.label:'Sistema elétrico';el('inspectSubtitle').textContent=f?f.use:'Arquitetura funcional proposta para o retrofit.';el('statusPill').textContent=state.scenario==='normal'?'NORMAL':state.scenario==='outage'?'CONTINGÊNCIA':state.scenario==='branch'?'FALHA SETORIAL':'SURTO';el('statusPill').style.color=state.scenario==='normal'?'var(--green)':state.scenario==='surge'?'var(--red)':'var(--amber)';
    if(f){el('inspectContent').innerHTML=`<div class="metric-grid">${metric('ÁREA BRUTA',f.area,'laje de referência')}${metric('ÁREA MAPEADA',f.mapped,'estimativa da planilha')}${metric('QUADRO SETORIAL',f.panel,'posição esquemática')}${metric('USO',f.rooms,'conforme arquivos do projeto')}</div><div class="info-block"><h3>DADOS DA PLANTA</h3>${row('Pavimento',f.label)}${row('Dimensão da laje','32,50 × 18,00 m')}${row('Base geométrica','Referências SKP + áreas; layout 3D esquemático')}</div><div class="info-block"><h3>OBSERVAÇÕES</h3><div class="data-row"><span>${f.notes}</span></div></div>`;
    }else{el('inspectContent').innerHTML=`<div class="metric-grid">${metric('CARGA INSTALADA','220,5 kW','valor consolidado na documentação')}${metric('ÁREA CONSTRUÍDA','4.090 m²','valor do documento; divergente das plantas')}${metric('UPS','30–40 kVA','faixa indicada; validar cargas/autonomia')}${metric('INVESTIMENTO BASE','R$ 463.800','orçamento acadêmico documentado')}</div><div class="info-block"><h3>FONTES E DISTRIBUIÇÃO</h3>${row('Fonte normal','Concessionária → QGBT')}${row('Fonte alternativa','Gerador → ATS / QTA → QDE')}${row('Cargas ininterruptas','UPS → QD-UPS')}${row('Tensão de referência','380/220 V · 60 Hz · premissa acadêmica')}</div><div class="info-block"><h3>PROTEÇÕES PREVISTAS</h3>${row('Sobrecorrente','Disjuntores · valores em aberto')}${row('Corrente diferencial','DR indicado · 30 mA no material')}${row('Sobretensão transitória','DPS · seleção/coordenação em aberto')}</div><div class="info-block"><h3>CONFERÊNCIA DE ÁREAS</h3>${row('Documentação técnica','4.090 m²')}${row('PDF de métricas','2.490 m²')}${row('Planilha (5 lajes)','2.925 m²')}</div>`;}
    renderPath();}
  const scenarios={normal:{state:'REDE NORMAL',detail:'Fonte normal disponível · ATS em posição normal'},outage:{state:'FALTA DA REDE · GERADOR EM TRANSFERÊNCIA',detail:'UPS sustenta cargas críticas durante a sequência ilustrativa'},branch:{state:'FALHA SETORIAL · QD-P03',detail:'Circuito representado isolado · demais setores permanecem ativos'},surge:{state:'SURTO · DPS EM DESTAQUE',detail:'Atuação conceitual indicada · não modela forma de onda ou energia'}};
  function setScenario(s){state.scenario=s;document.body.dataset.state=s;document.querySelectorAll('.scenario').forEach(b=>b.classList.toggle('active',b.dataset.scenario===s));el('scenarioState').textContent=scenarios[s].state;el('scenarioDetail').textContent=scenarios[s].detail;dpsFlash.visible=s==='surge'&&state.protection;renderInspector();}
  document.querySelectorAll('.scenario').forEach(b=>b.addEventListener('click',()=>setScenario(b.dataset.scenario)));
  el('energyToggle').onchange=e=>{state.energy=e.target.checked;pathGroup.visible=state.energy;};el('protectionToggle').onchange=e=>{state.protection=e.target.checked;dpsFlash.visible=state.scenario==='surge'&&state.protection;};el('architectureToggle').onchange=e=>{state.architecture=e.target.checked;setFloorVisibility();};
  el('resetView').onclick=()=>{state.floor=null;state.orbit={theta:.72,phi:1.08,r:62};target.set(0,7,0);setFloorVisibility();applyCamera();el('viewLabel').textContent='VISTA GERAL · 5 NÍVEIS';el('floorTooltip').textContent='Selecione um pavimento para ver seus dados.';renderInspector();};
  el('topView').onclick=()=>{state.orbit.theta=0;state.orbit.phi=.12;state.orbit.r=68;target.set(0,7,0);applyCamera();};
  let time=0;function animate(){requestAnimationFrame(animate);time+=.016;
    // Emphasis follows the qualitative operating state; no timing values represent equipment settings.
    const normal=state.scenario==='normal',out=state.scenario==='outage',branch=state.scenario==='branch',surge=state.scenario==='surge';
    const color=out?0xe5a746:branch?0x47d4d3:surge?0x47d4d3:0x47d4d3;
    utilityLine.material.color.setHex(out?0x43505d:0x9ade43);utilityLine.material.opacity=out?.24:.9;
    generatorLine.material.color.setHex(out?0x9ade43:0xe5a746);generatorLine.material.opacity=out?1:.36;
    riserLine.material.color.setHex(0x47d4d3);riserLine.material.opacity=.9;
    branchLines.forEach((l,i)=>{l.material.color.setHex(branch&&i===2?0xf16d6d:0x47d4d3);l.material.opacity=branch&&i===2?.95:.72;});
    circuitLines.forEach((l,i)=>{const failed=branch&&Math.floor(i/2)===2;l.material.color.setHex(failed?0xf16d6d:0x47d4d3);l.material.opacity=failed?.95:.48;});
    const pathY=out?3.5:Math.min(13.8,1+(time%4)*3.1);flowDots.forEach((d,i)=>{d.visible=state.energy&&(!branch||i!==6);const yy=out?3.45+((time+i*.17)%1)*.1:pathY;const xx=out?13-(((time+i*.11)%1)*8):4.0;d.position.set(xx,yy,out?4:1.1);d.material.color.setHex(branch&&i===6?0xf16d6d:color);});
    if(surge&&state.protection){dpsFlash.visible=true;dpsFlash.material.opacity=.24+.4*Math.abs(Math.sin(time*4));}else dpsFlash.visible=false;
    if(out){gridMarker.material.color.setHex(0x6a7882);gridLabel.visible=false;}else{gridMarker.material.color.setHex(0x9ade43);gridLabel.visible=true;}
    renderer.render(scene,camera);
  }
  setFloorVisibility();renderInspector();animate();
})();
