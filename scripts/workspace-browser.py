import json,time,base64
from playwright.sync_api import sync_playwright
uid='91000000-0000-0000-0000-000000000001'; iid='92000000-0000-0000-0000-000000000001'
inst=dict(id=iid,name='Instituição de teste',status='active')
project=dict(id='p1',institution_id=iid,name='Projeto real de teste',summary='Descrição de teste',category='Educação',stage='Descoberta',year=2026,semester=2,archived=False,created_at='2026-10-25T10:00:00Z')
criterion=dict(id='c1',name='Inovação',weight=1,active=True,descriptors=['1','2','3','4','5'])
event=dict(id='e1',name='Banca de teste',status='open',scheduled_at='2026-12-01T10:00:00Z',criteria_snapshot=[criterion],results_published=False)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',args=['--no-sandbox'])
 for role in ['platform','institution_admin','coordinator','mentor','evaluator','student']:
  context=browser.new_context(viewport={'width':390,'height':844})
  token='eyJhbGciOiJIUzI1NiJ9.'+base64.urlsafe_b64encode(json.dumps({'sub':uid,'exp':int(time.time())+3600}).encode()).decode().rstrip('=')+'.test'
  session=dict(access_token=token,refresh_token='mock',expires_at=int(time.time())+3600,expires_in=3600,token_type='bearer',user={'id':uid,'email':'test@example.test'})
  context.add_init_script('localStorage.setItem("sb-sahxhhbpagnygnpjtfxz-auth-token",'+json.dumps(json.dumps(session))+');')
  admin=role in ['platform','institution_admin']; manager=admin or role=='coordinator'
  identity=dict(user={'id':uid,'email':'test@example.test'},isPlatformAdministrator=role=='platform',memberships=[dict(id='m1',institution_id=iid,status='active',institutions=inst,membership_roles=[{'role':'evaluator' if role=='platform' else role}])])
  data=dict(institution=inst,capabilities=dict(manageMembers=admin,manageProjects=admin,manageEvents=manager,manageCriteria=admin,evaluate=role=='evaluator',readAudit=admin),projects=[project],participants=[dict(project_id='p1',user_id=uid,kind='student' if role=='student' else 'mentor')],criteria=[criterion],events=[event],eventProjects=[dict(event_id='e1',project_id='p1')],eventEvaluators=[dict(event_id='e1',user_id=uid)],evaluations=[],memberships=[dict(id='m1',user_id=uid,status='active',roles=[role],requested_role=None)],people=[dict(id=uid,name='Pessoa teste',email='test@example.test')],results=[],audit=[])
  commands=[]
  def route(r):
   url=r.request.url
   if '/api/auth/me' in url:body=identity
   elif '/api/admin/institutions' in url:body={'institutions':[inst]}
   elif '/workspace/catalog' in url:body={'institutions':[inst]}
   elif '/commands' in url:commands.append(r.request.post_data_json);body={'ok':True,'id':'p1'}
   else:body=data
   r.fulfill(json=body)
  context.route('**/api/**',route)
  page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto('http://127.0.0.1:5173/conta');page.get_by_role('heading',name='O que pede atenção').wait_for()
  nav=page.get_by_role('navigation')
  assert nav.get_by_text('Usuários e acessos').count()==int(admin)
  assert nav.get_by_text('Avaliações',exact=True).count()==int(role=='evaluator')
  nav.get_by_text('Projetos e',exact=False).click();page.get_by_role('button',name='Projeto real de teste',exact=True).wait_for()
  if admin:
   page.get_by_role('button',name='Novo projeto',exact=True).click();page.get_by_label('Nome do projeto',exact=True).fill('Projeto criado');page.get_by_label('Descrição do projeto').fill('Descrição criada');page.get_by_role('button',name='Salvar projeto').click();page.get_by_role('status').filter(has_text='Alteração registrada').wait_for();assert commands[-1]['action']=='project.save'
  elif role=='student':
   page.get_by_role('button',name='Projeto real de teste',exact=True).click();page.get_by_role('button',name='Editar descrição').click();assert page.get_by_label('Nome do projeto',exact=True).count()==0
  elif role=='evaluator':
   nav.get_by_text('Avaliações',exact=True).click();page.get_by_label('Banca para avaliar').select_option('e1');page.get_by_label('Projeto para avaliar').select_option('p1');page.get_by_label('Nota para Inovação').select_option('5');page.get_by_role('button',name='Enviar avaliação').click();page.get_by_text('Avaliação registrada.',exact=False).wait_for();assert commands[-1]['data']['scores']=={'c1':5}
  for module in ['events','criteria','results','podium','access']+(['members','reports','audit'] if admin else []):
   page.goto('http://127.0.0.1:5173/app/'+module);page.locator('.workspace-content').wait_for();page.wait_for_timeout(200)
  page.goto('http://127.0.0.1:5173/conta');page.get_by_role('heading',name='O que pede atenção').wait_for();assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), 'Mobile overflow'
  if role=='platform':page.screenshot(path='/tmp/catapimba-workspace-mobile.png',full_page=True)
  assert not errors,errors
  print('PASS browser',role,flush=True);context.close()
 browser.close()
