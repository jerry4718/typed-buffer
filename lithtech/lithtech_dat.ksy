meta:
  id: lithtech_dat
  title: Lithtech dat map file format
  file-extension: dat
  ks-version: 0.0.2
  endian: le

types:
  # basic types
  str_2h:
    seq:
      - id: byte_size
        type: u2
      - id: data
        type: str
        encoding: ASCII
        size: byte_size
        if: byte_size != 0
  str_4h:
    seq:
      - id: byte_size
        type: u4
      - id: data
        type: str
        encoding: ASCII
        size: byte_size
        if: byte_size != 0
  surface:
    seq:
      - id: flags
        type: u4
      - id: texture_index
        type: u2
      - id: texture_flags
        type: u2
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
  color_rgb:
    seq:
      - id: r
        type: f4
      - id: g
        type: f4
      - id: b
        type: f4
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
  plane:
    seq:
      - id: normal
        type: vector3
      - id: dist
        type: f4
  vertex:
    seq:
      - id: pos
        type: vector3
      - id: uv1
        type: vector2
      - id: uv2
        type: vector2
      - id: color
        type: color_rgba
      - id: normal
        type: vector3
      # - id: tangent
      #   type: vector3
      # - id: bi_normal
      #   type: vector3
  polygon:
    seq:
      - id: plane
        type: plane
      - id: num_vertexes_pos
        type: u4
      - id: vertexes_pos
        type: vector3
        repeat: expr
        repeat-expr: num_vertexes_pos
  triangle:
    seq:
      - id: vertex_indexes
        type: u4
        repeat: expr
        repeat-expr: 3
      - id: poly_index
        type: u4
  data_property:
    seq:
      - id: name_box
        type: str_2h
      - id: type_code
        type: u1
      - id: flags
        type: u4
      - id: data_length
        type: u2
      - id: data
        type:
          switch-on: type_code
          cases:
            0x00: str_2h
            0x01: vector3
            0x02: color_rgb
            0x03: f4
            0x04: u4
            0x05: u1
            0x06: s4
            0x07: quaternion
    instances:
      name:
        value: name_box.data
      type:
        value: 'type_code == 0x00 ? "string" : type_code == 0x01 ? "vector3" : type_code == 0x02 ? "color" : type_code == 0x03 ? "f4" : type_code == 0x04 ? "flag" : type_code == 0x05 ? "bool" : type_code == 0x06 ? "int" : type_code == 0x07 ? "quaternion" : "unknown"'
  world_data_item:
    seq:
      - id: object_length
        type: u2
      - id: type_box
        type: str_2h
      - id: num_data_properties
        type: u4
      - id: data_properties
        type: data_property
        if: num_data_properties != 0
        repeat: expr
        repeat-expr: num_data_properties
    instances:
      type:
        value: type_box.data
  # world model types
  world_model_polygon:
    params:
      - id: num_vertex_indexes
        type: u4
    seq:
      - id: surface_index
        type: u4
      - id: plane_index
        type: u4
      - id: vertex_indexes
        type: u4
        repeat: expr
        repeat-expr: num_vertex_indexes
  world_model_node:
    seq:
      - id: poly_index
        type: u4
      - id: reserved
        type: u2
      - id: node_sides_indices
        type: s4
        repeat: expr
        repeat-expr: 2
  world_model:
    seq:
      - id: reserved
        type: u4
        doc: always zero
      - id: world_info_flag
        type: u4
      - id: world_name_box
        type: str_2h
        doc: mainly used for world models
      - id: num_points
        type: u4
      - id: num_planes
        type: u4
      - id: num_surfaces
        type: u4
      - id: reserved1
        type: u4
      - id: num_polygons
        type: u4
      - id: reserved2
        type: u4
      - id: num_polygon_vertex_indexes
        type: u4
      - id: reserved3
        type: u4
      - id: reserved4
        type: u4
      - id: num_nodes
        type: u4
      - id: box_min
        type: vector3
      - id: box_max
        type: vector3
      - id: world_translation
        type: vector3
      - id: texture_name_size
        type: u4
      - id: num_texture_names
        type: u4
      - id: texture_names
        type: str
        terminator: 0
        encoding: ASCII
        repeat: expr
        repeat-expr: num_texture_names
      - id: vertex_count_list
        type: u1
        repeat: expr
        repeat-expr: num_polygons
      - id: planes
        type: plane
        repeat: expr
        repeat-expr: num_planes
      - id: surfaces
        type: surface
        repeat: expr
        repeat-expr: num_surfaces
      - id: polygons
        type: world_model_polygon(vertex_count_list[_index])
        repeat: expr
        repeat-expr: num_polygons
      - id: nodes
        type: world_model_node
        repeat: expr
        repeat-expr: num_nodes
      - id: points
        type: vector3
        repeat: expr
        repeat-expr: num_points
      - id: root_node_index
        type: s4
      - id: sections
        type: u4
        doc: reserved
    instances:
      world_name:
        value: world_name_box.data
  world_tree:
    seq:
      - id: box_min
        type: vector3
      - id: box_max
        type: vector3
      - id: child_num_nodes
        type: u4
      - id: dummy_terrain_depth
        type: u4
      - id: world_layout
        size: (child_num_nodes * 0.125 + 1).to_i
        doc: Oct-tree stored bitwise
      - id: num_world_models
        type: u4
      - id: world_models
        type: world_model
        repeat: expr
        repeat-expr: num_world_models
  # render world types
  sky_portal:
    seq:
      - id: num_vertexes_pos
        type: u1
      - id: vertexes_pos
        type: vector3
        if: num_vertexes_pos != 0
        repeat: expr
        repeat-expr: num_vertexes_pos
      - id: plane
        type: plane
  shader_poly:
    seq:
      - id: num_vertexes_pos
        type: u1
      - id: vertexes_pos
        type: vector3
        if: num_vertexes_pos != 0
        repeat: expr
        repeat-expr: num_vertexes_pos
      - id: plane
        type: plane
      - id: name
        type: u4
  render_section:
    seq:
      - id: textures_box
        type: str_2h
        repeat: expr
        repeat-expr: 2
      - id: shader_code
        type: u1
      - id: num_triangles
        type: u4
      - id: texture_effect_box
        type: str_2h
      - id: light_map_width
        type: u4
      - id: light_map_height
        type: u4
      - id: len_light_map_data
        type: u4
      - id: light_map_data
        size: len_light_map_data
    instances:
      textures:
        value: '[textures_box[0].data, textures_box[1].data]'
      texture_effect:
        value: texture_effect_box.data
  light_map_section:
    seq:
      - id: left
        type: u4
      - id: top
        type: u4
      - id: width
        type: u4
      - id: height
        type: u4
      - id: len_data
        type: u4
      - id: data
        size: len_data
  light_map_section_array:
    seq:
      - id: num_light_map_sections
        type: u4
      - id: light_map_sections
        type: light_map_section
        if: num_light_map_sections != 0
        repeat: expr
        repeat-expr: num_light_map_sections
  light_group:
    seq:
      - id: name
        type: str_2h
      - id: color
        type: vector3
      - id: len_n_intensity_data
        type: u4
      - id: n_intensity_data
        size: len_n_intensity_data
        doc: Data is zero compressed
      - id: num_light_map_sections_matrix
        type: u4
      - id: light_map_sections_matrix
        type: light_map_section_array
        if: num_light_map_sections_matrix != 0
        repeat: expr
        repeat-expr: num_light_map_sections_matrix
  render_block:
    seq:
      - id: center
        type: vector3
      - id: half_dims
        type: vector3
      # section array
      - id: num_sections
        type: u4
      - id: sections
        type: render_section
        if: num_sections != 0
        repeat: expr
        repeat-expr: num_sections
      # vertex array
      - id: num_vertexes
        type: u4
      - id: vertexes
        type: vertex
        if: num_vertexes != 0
        repeat: expr
        repeat-expr: num_vertexes
      # triangle array
      - id: num_triangles
        type: u4
      - id: triangles
        type: triangle
        if: num_triangles != 0
        repeat: expr
        repeat-expr: num_triangles
      # sky_portal array
      - id: num_sky_portals
        type: u4
      - id: sky_portals
        type: sky_portal
        if: num_sky_portals != 0
        repeat: expr
        repeat-expr: num_sky_portals
      # shader array
      - id: num_shaders
        type: u4
      - id: shaders
        type: shader_poly
        if: num_shaders != 0
        repeat: expr
        repeat-expr: num_shaders
        # light_group array
      - id: num_light_groups
        type: u4
      - id: light_groups
        type: light_group
        if: num_light_groups != 0
        repeat: expr
        repeat-expr: num_light_groups
        # children
      - id: child_flags
        type: u1
      - id: child_node_indices
        type: u4
        repeat: expr
        repeat-expr: 2
  world_model_render_block:
    seq:
      - id: name_box
        type: str_2h
      - id: num_render_blocks
        type: u4
      - id: render_blocks
        type: render_block
        if: num_render_blocks != 0
        repeat: expr
        repeat-expr: num_render_blocks
      - id: no_child_flag
        type: u4
        doc: always zero
    instances:
      name:
        value: name_box.data
  # light_data types
  light_data:
    seq:
      - id: lookup_start
        type: vector3
      - id: block_size
        type: vector3
      - id: lookup_size
        type: u4
        repeat: expr
        repeat-expr: 3
      - id: num_light_data_grid
        type: u4
      - id: light_data_grid
        type: u1
        if: num_light_data_grid != 0
        repeat: expr
        repeat-expr: num_light_data_grid
        doc: RLE compressed data
  # header
  header:
    seq:
      - id: dat_version
        contents: [ 0x55, 0x00, 0x00, 0x00 ]
      - id: world_data_pos
        type: u4
      - id: blind_data_pos
        type: u4
      - id: light_data_pos
        type: u4
      - id: physics_data_pos
        type: u4
      - id: particle_data_pos
        type: u4
      - id: render_data_pos
        type: u4
      # ignore 8 * 4
      - id: future
        type: u4
        repeat: expr
        repeat-expr: 8
  world:
    seq:
      - id: properties_box
        type: str_4h
      - id: extents_min
        type: vector3
      - id: extents_max
        type: vector3
      - id: world_offset
        type: vector3
    instances:
      properties:
        value: properties_box.data
  # instances
  world_data:
    seq:
      - id: num_world_data_list
        type: u4
      - id: world_data_list
        type: world_data_item
        if: num_world_data_list != 0
        repeat: expr
        repeat-expr: num_world_data_list
  physics_data:
    seq:
      - id: num_polygons
        type: u4
      - id: polygons
        type: polygon
        if: num_polygons != 0
        repeat: expr
        repeat-expr: num_polygons
  particle_data:
    seq:
      - id: num_polygons
        type: u4
      - id: polygons
        type: polygon
        if: num_polygons != 0
        repeat: expr
        repeat-expr: num_polygons
  render_data:
    seq:
      - id: num_render_blocks
        type: u4
      - id: render_blocks
        type: render_block
        if: num_render_blocks != 0
        repeat: expr
        repeat-expr: num_render_blocks
      - id: num_world_model_render_blocks
        type: u4
      - id: world_model_render_blocks
        type: world_model_render_block
        if: num_world_model_render_blocks != 0
        repeat: expr
        repeat-expr: num_world_model_render_blocks

seq:
  - id: header
    type: header
  - id: world
    type: world
  - id: world_tree
    type: world_tree
instances:
  world_data:
    pos: header.world_data_pos
    type: world_data
  blind_data_len:
    pos: header.blind_data_pos
    type: u4
    doc: not yet supported
  light_data:
    pos: header.light_data_pos
    type: light_data
  physics_data:
    pos: header.physics_data_pos
    type: physics_data
  particle_data:
    pos: header.particle_data_pos
    type: particle_data
  render_data:
    pos: header.render_data_pos
    type: render_data
