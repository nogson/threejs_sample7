(() => {

    window.addEventListener('load', () => {

        // 汎用変数の宣言
        let width = window.innerWidth; // ブラウザのクライアント領域の幅
        let height = window.innerHeight; // ブラウザのクライアント領域の高さ
        let targetDOM = document.getElementById('webgl'); // スクリーンとして使う DOM

        // three.js 定義されているオブジェクトに関連した変数を宣言
        let scene; // シーン
        let camera; // カメラ
        let renderer; // レンダラ
        let axis; //ガイド
        let grid; //ガイド
        let directional;
        let ambient;
        let zoomVal = 0;
        let isZoom = true;
        let zoomFlags = [];


        // 各種パラメータを設定するために定数オブジェクトを定義
        let CAMERA_PARAMETER = { // カメラに関するパラメータ
            fovy: 90,
            aspect: width / height,
            near: 0.1,
            far: 100.0,
            x: 15.0, // + 右 , - 左
            y: 2, // + 上, - 下
            z: 8.5, // + 手前, - 奥
            lookAt: new THREE.Vector3(0.0, 0.0, 0.0) //x,y,z
        };
        let RENDERER_PARAMETER = { // レンダラに関するパラメータ
            clearColor: 0xffffff, //背景のリセットに使う色
            width: width,
            height: height
        };

        let LIGHT_PARAMETER = {
            directional: {
                positionX: -0.5,
                positionY: 4,
                positionZ: 3
            },
            ambient: {
                positionY: 1
            }
        };

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            CAMERA_PARAMETER.fovy,
            CAMERA_PARAMETER.aspect,
            CAMERA_PARAMETER.near,
            CAMERA_PARAMETER.far
        );

        camera.position.x = CAMERA_PARAMETER.x;
        camera.position.y = CAMERA_PARAMETER.y;
        camera.position.z = CAMERA_PARAMETER.z;
        camera.lookAt(CAMERA_PARAMETER.lookAt); //注視点（どこをみてるの？）

        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor(new THREE.Color(RENDERER_PARAMETER.clearColor));
        renderer.setSize(RENDERER_PARAMETER.width, RENDERER_PARAMETER.height);

        renderer.shadowMap.enabled = true; //影を有効
        targetDOM.appendChild(renderer.domElement); //canvasを挿入する

        let controls = new THREE.OrbitControls(camera, render.domElement);

        //ライト
        directional = new THREE.DirectionalLight(0xffffff);
        ambient = new THREE.AmbientLight(0xffffff, 0.25);

        directional.castShadow = true;


        directional.position.y = LIGHT_PARAMETER.directional.positionY;
        directional.position.z = LIGHT_PARAMETER.directional.positionZ;
        directional.position.x = LIGHT_PARAMETER.directional.positionX;
        ambient.position.y = LIGHT_PARAMETER.ambient.positionY;

        directional.castShadow = true;
        directional.shadow.mapSize.width = 800;
        directional.shadow.mapSize.height = 800;
        scene.add(directional);
        scene.add(ambient);

        // axis = new THREE.AxisHelper(1000);
        // axis.position.set(0, 0, 0);
        // scene.add(axis);

        // // グリッドのインスタンス化
        // grid = new THREE.GridHelper(100, 50);

        // //グリッドオブジェクトをシーンに追加する
        // scene.add(grid);

        let textuerLoader = new THREE.TextureLoader();

        let mat = new THREE.MeshPhongMaterial({
            //color: 0x333333,
            //wireframe: true,
            side: THREE.DoubleSide
        });

        let plane = new THREE.Mesh(
            new THREE.PlaneGeometry(25, 25, 5, 5),
            new THREE.MeshPhongMaterial({
                color: 0xFFFFFF,
                side: THREE.DoubleSide
            }));
        plane.position.y = -7;
        plane.rotation.set(Math.PI / 2, 0, 0);
        plane.receiveShadow = true;
        scene.add(plane);

        const SEGMENTS = 20;
        let geom = new THREE.SphereBufferGeometry(5, SEGMENTS - 1, SEGMENTS - 1);
        let vertexCount = geom.attributes.position.count;

        let count = 0;

        let p = geom.attributes.position.array;


        for (let i = 0; i < vertexCount; i++) {
            zoomFlags[i] = true;
        }


        let textuer = textuerLoader.load('images/tx2.png');
        mat.map = textuer;

        let mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;

        scene.add(mesh);


        render();

        //描画
        function render() {
            //player.position.z += 0.01;

            // rendering
            renderer.render(scene, camera);

            animation();

            // animation
            requestAnimationFrame(render);
        }


        function animation() {

            for (let i = 0; i < vertexCount; i++) {

                let x = geom.attributes.position.getX(i);
                let y = geom.attributes.position.getY(i);
                let z = geom.attributes.position.getZ(i);
                let dis = x * x + y * y + z * z;
                let size = Math.sqrt(x * x + y * y + z * z);

                if (dis > 30 && zoomFlags[i]) {
                    zoomFlags[i] = false;
                } else if (dis < 20 && !zoomFlags[i]) {
                    zoomFlags[i] = true;
                }
                if (Math.floor(Math.random() * 3) === 0) {


                    if (zoomFlags[i]) {
                        x += (x / size) * 0.1;
                        y += (y / size) * 0.1;
                        z += (z / size) * 0.1;
                    } else {
                        x -= (x / size) * 0.1;
                        y -= (y / size) * 0.1;
                        z -= (z / size) * 0.1;
                    }

                }
                geom.attributes.position.setXYZ(i, x, y, z)
            }


            geom.attributes.position.needsUpdate = true;

            geom.computeFaceNormals();
            geom.computeVertexNormals();
        }

    }, false);
})();