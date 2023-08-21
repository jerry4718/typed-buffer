meta:
  id: lithtech_ltb
  file-extension: ltb
  endian: le
enums:
  mesh_type:
    4: rigid_mesh
    5: skeletal_mesh
    6: vertex_animated_mesh
    7: null_mesh
  data_mark:
    0: lie_position
    1: lie_normal
    2: lie_color
    4: lie_uv_1
    5: lie_uv_2
    6: lie_uv_3
    7: lie_uv_4
    8: lie_basis_vector
  anim_compression_type:
    0: cmp_none
    1: cmp_relevant
    2: cmp_relevant_16
    3: cmp_relevant_rot16
  obb_version:
    23: v23
    24: v24
    25: v25
  error_mark:
    0xff: invalid_bone

seq:
  - id: header
    type: header
  - id: body
    type: body

types:
  header:
    seq:
      - id: file_type
        type: u2
      - id: file_version
        type: u2
      - id: space_unknown
        type: u4
        repeat: expr
        repeat-expr: 4
      - id: version
        type: s4
      - id: num_keyframe
        type: s4
      - id: num_animations
        type: s4
      - id: num_nodes
        type: s4
      - id: num_pieces_no_use
        type: s4
      - id: num_child_models
        type: s4
      - id: num_faces
        type: s4
      - id: num_vertexes
        type: s4
      - id: num_vertex_weights
        type: s4
      - id: num_lod
        type: s4
      - id: num_sockets
        type: s4
      - id: num_weight_sets
        type: s4
      - id: num_strings
        type: s4
      - id: string_length
        type: s4
      - id: vertex_animation_data_size
        type: s4
      - id: animation_data_size
        type: s4
      - id: command_string_box
        type: str_2h
      - id: internal_radius
        type: f4
    instances:
      command_string:
        value: command_string_box.data

  body:
    seq:
      - id: num_o_b_bs
        type: s4
      - id: model_o_b_bs
        type:
          switch-on: _root.header.version
          cases:
            'obb_version::v23.to_i': model_o_b_b(true)
            'obb_version::v24.to_i': model_o_b_b(false)
            'obb_version::v25.to_i': model_o_b_b(false)
        repeat: expr
        repeat-expr: num_o_b_bs
      - id: num_pieces
        type: s4
      - id: pieces
        type: piece
        repeat: expr
        repeat-expr: num_pieces
        if: num_pieces != 0
      - id: bone_tree
        type: bone_node
      - id: num_weight_sets
        type: u4
      - id: weight_sets
        type: weight_set
        repeat: expr
        repeat-expr: num_weight_sets
      - id: num_child_models
        type: u4
      - id: child_models
        type: child_model
        repeat: expr
        repeat-expr: num_child_models - 1
      - id: num_animations
        type: u4
      - id: animations
        type: animation
        repeat: expr
        repeat-expr: num_animations
      - id: num_sockets
        type: u4
      - id: sockets
        type: socket
        repeat: expr
        repeat-expr: num_sockets
      - id: num_anim_bindings
        type: u4
      - id: anim_bindings
        type: anim_binding
        repeat: expr
        repeat-expr: num_anim_bindings

  model_o_b_b:
    params:
      - id: deprecated
        type: bool
    seq:
      - id: pos
        type: vector3
        doc: local pos or offset
      - id: size
        type: vector3
        doc: box size
      - id: basis
        type: vector3
        repeat: expr
        repeat-expr: 3
        doc: orientation. XYZ
      - id: i_node
        type: u4
        doc: which  model node  do I belong to
      - id: radius
        type: f4
        doc: |
          "Best fit" sphere radius of the OBB.
          Used to speed up "early out" OBB checks
        if: not deprecated

  piece:
    seq:
      - id: name_box
        type: str_2h
      - id: num_lod
        type: u4
      - id: lod_distances
        type: f4
        repeat: expr
        repeat-expr: num_lod
        if: num_lod != 0
      - id: lod_min
        type: u4
      - id: lod_max
        type: u4
      - id: render_objects
        type: render_object
        repeat: expr
        repeat-expr: num_lod
        if: num_lod != 0
    instances:
      name:
        value: name_box.data

  render_object:
    seq:
      - id: num_textures
        type: u4
      - id: textures
        type: u4
        repeat: expr
        repeat-expr: 4
        doc: that MAX_PIECE_TEXTURES = 4
      - id: render_style
        type: u4
      - id: render_priority
        type: u1
      - id: render_object_type
        type: u4
      - id: lod_mesh
        type:
          switch-on: render_object_type
          cases:
            4: rigid_mesh
            5: skeletal_mesh
            6: vertex_animated_mesh
            7: null_mesh
            _: unknown_mesh
      - id: num_used_nodes
        type: u1
      - id: used_nodes
        type: u1
        repeat: expr
        repeat-expr: num_used_nodes

  rigid_mesh:
    seq:
      - id: mesh_info
        type: lod_mesh_info
      - id: vertex_type_map
        type: u4
        repeat: expr
        repeat-expr: 4
      - id: bone
        type: u4
      - id: vertex_container
        type: vertex_container(mesh_info.num_vertexes, mesh_info.max_bones_per_face, vertex_type_map[_index], mesh_type::rigid_mesh.to_i)
        repeat: expr
        repeat-expr: 4
      - id: vertex_index
        type: u2
        repeat: expr
        repeat-expr: mesh_info.num_faces * 3

  skeletal_mesh:
    seq:
      - id: mesh_info
        type: lod_mesh_info
      - id: re_indexed_bone
        type: u1
      - id: vertex_type_map
        type: u4
        repeat: expr
        repeat-expr: 4
      - id: matrix_palette
        type: u1
      - id: vertex_container
        type: vertex_container(mesh_info.num_vertexes, mesh_info.max_bones_per_face, vertex_type_map[_index], mesh_type::skeletal_mesh.to_i)
        repeat: expr
        repeat-expr: 4
      - id: vertex_index
        type: u2
        repeat: expr
        repeat-expr: mesh_info.num_faces * 3
      - id: num_bone_set
        type: u4
      - id: bone_set
        type: bone_set
        repeat: expr
        repeat-expr: num_bone_set

  vertex_animated_mesh:
    seq:
      - id: mesh_info
        type: lod_mesh_info

  null_mesh:
    seq:
      - id: offset
        type: u1

  unknown_mesh:
    seq:
      - id: mesh_info
        type: lod_mesh_info

  lod_mesh_info:
    seq:
      - id: obj_size
        type: u4
      - id: num_vertexes
        type: u4
      - id: num_faces
        type: u4
      - id: max_bones_per_face
        type: u4
      - id: max_bones_per_vert
        type: u4

  vertex_container:
    params:
      - id: num_vertexes
        type: u4
      - id: max_bones_per_face
        type: u4
      - id: mask
        type: u4
      - id: mesh_type
        type: u4
    seq:
      - id: vertex_infos
        type: vertex_info
        repeat: expr
        repeat-expr: num_vertexes
        if: mask > 0
    instances:
      has_position:
        value: mask & (1 << data_mark::lie_position.to_i) > 0
      has_normal:
        value: mask & (1 << data_mark::lie_normal.to_i) > 0
      has_color:
        value: mask & (1 << data_mark::lie_color.to_i) > 0
      has_uv_1:
        value: mask & (1 << data_mark::lie_uv_1.to_i) > 0
      has_uv_2:
        value: mask & (1 << data_mark::lie_uv_2.to_i) > 0
      has_uv_3:
        value: mask & (1 << data_mark::lie_uv_3.to_i) > 0
      has_uv_4:
        value: mask & (1 << data_mark::lie_uv_4.to_i) > 0
      has_basis_vector:
        value: mask & (1 << data_mark::lie_basis_vector.to_i) > 0
      is_vertex_used:
        value: has_position or has_normal or has_color or has_basis_vector
      is_face_vertex_used:
        value: has_uv_1 or has_uv_2 or has_uv_3 or has_uv_4

  vertex_info:
    seq:
      - id: position
        type: vector3
        if: _parent.has_position
      - id: weight_blend
        type: vertex_weight_blend(_index, _parent.max_bones_per_face)
        repeat: expr
        repeat-expr: _parent.max_bones_per_face
        if: _parent.has_position and _parent.mesh_type == mesh_type::skeletal_mesh.to_i
      - id: normal
        type: vector3
        if: _parent.has_normal
      - id: color
        type: color_rgba
        if: _parent.has_color
      - id: uv_1
        type: vector2
        if: _parent.has_uv_1
      - id: uv_2
        type: vector2
        if: _parent.has_uv_2
      - id: uv_3
        type: vector2
        if: _parent.has_uv_3
      - id: uv_4
        type: vector2
        if: _parent.has_uv_4
      - id: s
        type: vector3
        if: _parent.has_basis_vector
      - id: t
        type: vector3
        if: _parent.has_basis_vector

  vertex_weight_blend:
    params:
      - id: bone_face_index
        type: u4
      - id: max_bones_per_face
        type: u4
    seq:
      - id: blend
        type: f4
        if: bone_face_index > 0 and max_bones_per_face >= (bone_face_index + 1)

  bone_set:
    seq:
      - id: index_start
        type: u2
      - id: num_indexes
        type: u2
      - id: bone_list
        type: u1
        repeat: expr
        repeat-expr: 4
      - id: index_buffer_index
        type: u4

  bone_node:
    seq:
      - id: name_box
        type: str_2h
      - id: index
        type: u2
      - id: flags
        type: s1
      - id: bind_matrix
        type: matrix
      - id: num_children
        type: u4
      - id: children
        type: bone_node
        repeat: expr
        repeat-expr: num_children
    instances:
      name:
        value: name_box.data

  weight_set:
    seq:
      - id: name_box
        type: str_2h
      - id: num_nodes
        type: u4
      - id: node_weights
        type: f4
        repeat: expr
        repeat-expr: num_nodes
    instances:
      name:
        value: name_box.data

  child_model:
    seq:
      - id: name_box
        type: str_2h
    instances:
      name:
        value: name_box.data

  animation:
    seq:
      - id: extents
        type: vector3
      - id: name_box
        type: str_2h
      - id: compression_type
        type: s4
      - id: interpolation_time
        type: u4
      - id: num_keyframes
        type: u4
      - id: keyframes
        type: keyframe
        repeat: expr
        repeat-expr: num_keyframes
      - id: node_keyframe_transforms
        type:
          switch-on: compression_type
          cases:
            'anim_compression_type::cmp_none.to_i': uncompressed_transform(num_keyframes)
            _: compressed_transform(compression_type)
    instances:
      name:
        value: name_box.data

  keyframe:
    seq:
      - id: time
        type: u4
      - id: string_box
        type: str_2h
    instances:
      string:
        value: string_box.data

  uncompressed_transform:
    params:
      - id: num_keyframes
        type: u4
    instances:
      num_positions:
        value: num_keyframes
      num_rotations:
        value: num_keyframes
    seq:
      - id: is_vertex_animation
        type: s1
      - id: positions
        type: vector3
        repeat: expr
        repeat-expr: num_positions
      - id: rotations
        type: quaternion
        repeat: expr
        repeat-expr: num_rotations

  compressed_transform:
    params:
      - id: compression_type
        type: s4
    seq:
      - id: node_transforms
        type: node_transform(compression_type)
        repeat: expr
        repeat-expr: _root.header.num_nodes

  node_transform:
    params:
      - id: compression_type
        type: s4
    seq:
      - id: num_positions
        type: u4
      - id: positions
        type:
          switch-on: compression_type
          cases:
            'anim_compression_type::cmp_relevant.to_i': vector3
            'anim_compression_type::cmp_relevant_16.to_i': compressed_vector3
            'anim_compression_type::cmp_relevant_rot16.to_i': vector3
        repeat: expr
        repeat-expr: num_positions
      - id: num_rotations
        type: u4
      - id: rotations
        type:
          switch-on: compression_type
          cases:
            'anim_compression_type::cmp_relevant.to_i': quaternion
            'anim_compression_type::cmp_relevant_16.to_i': compressed_quaternion
            'anim_compression_type::cmp_relevant_rot16.to_i': compressed_quaternion
        repeat: expr
        repeat-expr: num_rotations

  socket:
    seq:
      - id: node_index
        type: u4
      - id: name_box
        type: str_2h
      - id: rotation
        type: quaternion
      - id: position
        type: vector3
      - id: scale
        type: vector3
    instances:
      name:
        value: name_box.data

  anim_binding:
    seq:
      - id: name_box
        type: str_2h
      - id: extents
        type: vector3
      - id: origin
        type: vector3
    instances:
      name:
        value: name_box.data

  matrix:
    seq:
      - id: rows
        type: matrix_row
        repeat: expr
        repeat-expr: 4
        doc: (0:4, 4:8, 8:12, 12:16)
    instances:
      data:
        value: '[rows[0].data, rows[1].data, rows[2].data, rows[3].data]'

  matrix_row:
    seq:
      - id: data
        type: f4
        repeat: expr
        repeat-expr: 4

  str_2h:
    seq:
      - id: len
        type: u2
      - id: data
        type: str
        encoding: ASCII
        size: len
        if: len != 0

  vector2:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4

  vector3:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4

  color_rgba:
    seq:
      - id: r
        type: u1
      - id: g
        type: u1
      - id: b
        type: u1
      - id: a
        type: u1
    instances:
      origin_hex:
        value: (r << 6) & (g << 4) & (b << 2) & a

  compressed_vector3:
    seq:
      - id: x
        type: s2
      - id: y
        type: s2
      - id: z
        type: s2
    instances:
      decompress_value:
        value: 16.0

  quaternion:
    seq:
      - id: x
        type: f4
      - id: y
        type: f4
      - id: z
        type: f4
      - id: w
        type: f4

  compressed_quaternion:
    seq:
      - id: x
        type: s2
      - id: y
        type: s2
      - id: z
        type: s2
      - id: w
        type: s2
    instances:
      decompress_value:
        value: 0x7fff