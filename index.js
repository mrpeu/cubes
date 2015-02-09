

			var container, stats;
			var camera, scene, raycaster, renderer;

			var mouse = new THREE.Vector2(), INTERSECTED;
			var radius = 100, theta = 0, zoom = .6;

			var floor, items, zones, selectionZone;

			init();
			animate();

			function init() {

				var GRIDRES = 20;

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.OrthographicCamera( window.innerWidth / - 2 *zoom, window.innerWidth / 2*zoom, window.innerHeight / 2*zoom, window.innerHeight / - 2*zoom, -800, 1250 );

				scene = new THREE.Scene();

				var light = new THREE.DirectionalLight( 0xffffff, 1 );
				var shadowCameraSize = 700;
				light.position.set( -shadowCameraSize/5, shadowCameraSize/2.5, -shadowCameraSize/5 );
				light.castShadow = true;
				light.shadowCameraNear = 200;
				light.shadowCameraFar = shadowCameraSize;
				light.shadowCameraLeft = -shadowCameraSize;
				light.shadowCameraRight = shadowCameraSize;
				light.shadowCameraTop = shadowCameraSize;
				light.shadowCameraBottom = -shadowCameraSize;
				light.shadowMapWidth = 1024;
				light.shadowMapHeight = 1024;
				light.shadowDarkness = .3; // Default: .5
// 				light.shadowCameraVisible = true;
				scene.add( light );

// 				var light1 = light.clone();
// 				light1.position.set( shadowCameraSize/5, shadowCameraSize/2.5, shadowCameraSize/5 );
// 				scene.add( light1 );

				// floor

				floor = new THREE.Mesh(
					new THREE.PlaneGeometry( 1, 1 ),
					new THREE.MeshLambertMaterial({ color: 0xfefefe })
				);
				floor.material.ambient = floor.material.color;
				floor.translateY(-1);
 				floor.scale.set( 1600, 1600, 1 );
				floor.rotation.set(-Math.PI/2, 0, 0);
				floor.receiveShadow = true;
				scene.add( floor );

// 				var test = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: 0xff0000 } ) );
// 				scene.add( test );
// 				test.position.set( -50, 50, 0);

				scene.add( new THREE.AxisHelper( 25 ) );

				var gridHelper = new THREE.GridHelper( floor.scale.x / 2, floor.scale.x / 4 / GRIDRES );
				gridHelper.setColors( 0xa7a7a7, 0xc0c0c0 );
				gridHelper.translateY( -1 );
				gridHelper.receiveShadow = true;
				scene.add( gridHelper );


				// selection
				
				zones = new THREE.Object3D();
				scene.add( zones );

				selectionZone = addZoneRectangle( 0, 0, .5, GRIDRES*1.4,  GRIDRES*1.4, "selection", 0x0099E0 );
				selectionZone.visible = false;
				zones.add( selectionZone );

				zones.add( new addZoneCircle( 0, 0, -1, 40, "test", 0xf00aaa ) );
		

				// items 
				items = new THREE.Object3D();
				scene.add(items);

				var geometry = new THREE.BoxGeometry( GRIDRES, GRIDRES, GRIDRES );
				var nb = 50;
				for ( var i = 0; i < nb; i ++ ) {

					// var color = Math.random() * 0xffffff;
					var value = (i/nb) * 0xFF | 0;
					var grayscale = (value << 16) | (value << 8) | value;
					var color = '#' + grayscale.toString(16);

					var item = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: color } ) );

					var a = Math.random(), b = Math.random();
					item.position.set( 
						10 + ( a*((800/GRIDRES)<<0) * GRIDRES) - 400,
						0,
						10 + ( b*((800/GRIDRES)<<0) * GRIDRES) - 400
					);

					item.scale.set(
						( Math.random() * 3 << 0 ) + 1,
						1 + i/100,
						( Math.random() * 3 << 0 ) + 1
					);

					// item.rotation.x = Math.random() * 2 * Math.PI;
					// item.rotation.y = Math.random() * 2 * Math.PI;
					// item.rotation.z = Math.random() * 2 * Math.PI;

					item.castShadow = true;
					item.name = "item#" + i;
					items.add( item );

				}



				raycaster = new THREE.Raycaster();

				renderer = new THREE.WebGLRenderer({ antialias: true });
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.shadowMapEnabled = true;
				renderer.shadowMapSoft = false;
				container.appendChild(renderer.domElement);

				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				container.appendChild( stats.domElement );

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );

				document.addEventListener( 'click', onDocumentMouseClick, false );

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function addZoneRectangle( x, y, z, w, h, name, color ) {

				color = color || 0xa3a3a3;
				var _w = w/2, _h = h/2;

				var mat = new THREE.LineDashedMaterial({ color: color, dashSize: 6, gapSize: 3, linewidth: 2 });
				var geo = new THREE.Geometry();

				geo.vertices.push(
					new THREE.Vector3( x-_w, y, z-_h ),
					new THREE.Vector3( x+_w, y, z-_h ),
					new THREE.Vector3( x+_w, y, z+_h ),
					new THREE.Vector3( x-_w, y, z+_h ),
					new THREE.Vector3( x-_w, y, z-_h )
				);
				geo.computeLineDistances();

				var zone = new THREE.Line( geo, mat, THREE.LineStrip);
				zone.name = name;
				scene.add( zone );

				return zone;
			}

			function addZoneCircle( x, y, z, rad, name, color ) {

				color = color || 0xa3a3a3;

				var seg = 32;
				var mat = new THREE.LineDashedMaterial({ color: color, dashSize: 6, gapSize: 3, linewidth: 2 });
				var geo = new THREE.Geometry();

				for(var i = 0; i <= seg; i++) {
					var segment = ( i * 360/seg ) * Math.PI / 180;
					geo.vertices.push( new THREE.Vector3( Math.cos( segment ) * rad, 0, Math.sin( segment ) * rad ) );
				}
				geo.computeLineDistances();

				var zone = new THREE.Line( geo, mat, THREE.LineStrip );
				zone.name = name;
				scene.add( zone );

				return zone;
			}

			function selectObject( item ) {

				if( item ) {

					selectionZone.target = item;					
					selectionZone.position.set( item.position.x, item.position.y, item.position.z );
					selectionZone.scale.set( item.scale.x, item.scale.y, item.scale.z );
					selectionZone.material.color.setHex( 0x0099e0 );
					selectionZone.visible = true;

					var tweenable = new Tweenable();

					tweenable.tween({
					  from:     { value: .5, r: 0 },
					  to:       { value: 1, r: Math.PI*2 },
					  duration: 800,
					  step: function (state) {
						selectionZone.scale.set( item.scale.x * state.value, 1, item.scale.z * state.value );
						selectionZone.rotation.set( 0, state.r, 0 );
					  },
					  finish: function (state) {
					  },
					  easing : 'bounce'
					});

					document.querySelector(".title span").innerHTML = item.name + "</br>" + item.position.x + " - " + item.position.y;

				} else {

					selectionZone.visible = false;

					document.querySelector(".title span").innerHTML = "";

					selectionZone.target = null;
				}
			}

			function onWindowResize() {

				camera.left = window.innerWidth / - 2 * zoom;
				camera.right = window.innerWidth / 2 * zoom;
				camera.top = window.innerHeight / 2 * zoom;
				camera.bottom = window.innerHeight / - 2 * zoom;

				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );
			}

			function onDocumentMouseMove( event ) {

				event.preventDefault();

				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

				mouse.moved = true;
			}

			function onDocumentMouseClick( event ) {

				event.preventDefault();

				selectObject( INTERSECTED );
			}




			// loop

			function animate() {

				requestAnimationFrame( animate );

				render();

				stats.update();

			}

			function render() {

// 				theta += 0.1;

// 				camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta ) );
				camera.position.y = radius / 3;//Math.cos( THREE.Math.degToRad( theta )/2 );
// 				camera.position.z = radius * Math.cos( THREE.Math.degToRad( theta/360 ) );
				camera.lookAt( scene.position );

				camera.updateMatrixWorld();

				// find intersections

				raycaster.setFromCamera( mouse, camera );

				if( mouse.moved ){

					mouse.moved = false;

					var intersects = raycaster.intersectObjects( items.children );

					if ( intersects.length > 0 ) {

						if ( INTERSECTED != intersects[ 0 ].object ) {

							if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

							INTERSECTED = intersects[ 0 ].object;
							INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
							INTERSECTED.material.emissive.setHex( 0x0074B0 );
						}

						container.style.setProperty("cursor", "pointer");

					} else {

						if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

						INTERSECTED = null;

						container.style.setProperty("cursor", "default");
					}
				}

				renderer.render( scene, camera );
			}