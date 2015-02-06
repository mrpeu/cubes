

			var container, stats;
			var camera, scene, raycaster, renderer;

			var mouse = new THREE.Vector2(), INTERSECTED;
			var radius = 100, theta = 0;

			var floor, items;

			init();
			animate();

			function init() {

				container = document.createElement( 'div' );
				document.body.appendChild( container );

				camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 500, 1000 );

				scene = new THREE.Scene();

				var light = new THREE.DirectionalLight( 0xffffff, 1 );
				light.position.set( 1, 1, 1 ).normalize();
				// light.shadowMapWidth = 1024; // default is 512
				// light.shadowMapHeight = 1024; // default is 512
				scene.add( light );

				// floor

				floor = new THREE.Mesh(
					new THREE.PlaneGeometry( 1, 1 ),
					new THREE.MeshBasicMaterial({ color: 0xf0f0f0 })
				);
 				floor.scale.set( 1500, 1500, 1 );
				floor.rotation.set(-Math.PI/2, 0, 0);
				scene.add( floor );
		

				// items 
				items = new THREE.Object3D();
				scene.add(items);

				var geometry = new THREE.BoxGeometry( 20, 20, 20 );

				for ( var i = 0; i < 10; i ++ ) {

					// var color = Math.random() * 0xffffff;
					var value = Math.random() * 0xFF | 0;
					var grayscale = (value << 16) | (value << 8) | value;
					var color = '#' + grayscale.toString(16);

					var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: color } ) );

					object.position.x = Math.random() * 800 - 400;
// 					object.position.y = Math.random() * 800 - 400;
					object.position.z = Math.random() * 800 - 400;

					// object.rotation.x = Math.random() * 2 * Math.PI;
					// object.rotation.y = Math.random() * 2 * Math.PI;
					// object.rotation.z = Math.random() * 2 * Math.PI;

					object.scale.x = Math.random() + 0.5;
					object.scale.y = Math.random() + 0.5;
					object.scale.z = Math.random() + 0.5;

					items.add( object );

				}



				raycaster = new THREE.Raycaster();

				renderer = new THREE.WebGLRenderer();
				renderer.setClearColor( 0xf0f0f0 );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				renderer.sortObjects = false;
				// renderer.shadowMapType = THREE.PCFSoftShadowMap;
				container.appendChild(renderer.domElement);

				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				container.appendChild( stats.domElement );

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );

				//

				window.addEventListener( 'resize', onWindowResize, false );

			}

			function onWindowResize() {

				camera.left = window.innerWidth / - 2;
				camera.right = window.innerWidth / 2;
				camera.top = window.innerHeight / 2;
				camera.bottom = window.innerHeight / - 2;

				camera.updateProjectionMatrix();

				renderer.setSize( window.innerWidth, window.innerHeight );

			}

			function onDocumentMouseMove( event ) {

				event.preventDefault();

				mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
				mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

			}

			//

			function animate() {

				requestAnimationFrame( animate );

				render();

				stats.update();

			}

			function render() {

				theta += 0.75;

				camera.position.x = radius * Math.sin( THREE.Math.degToRad( theta )/2 );
				camera.position.y = radius;// * Math.sin( THREE.Math.degToRad( theta ) );
				camera.position.z = radius;// * Math.cos( THREE.Math.degToRad( theta ) );
				camera.lookAt( scene.position );

				camera.updateMatrixWorld();

				// find intersections

				raycaster.setFromCamera( mouse, camera );

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

				renderer.render( scene, camera );
			}