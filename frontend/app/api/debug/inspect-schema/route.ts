import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';

export async function GET() {
  try {
    // Get column information for waga_coffee_batches table
    const result = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'waga_coffee_batches' 
        AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    const columns = result.rows.map((row: any) => ({
      name: row.column_name,
      type: row.data_type,
      nullable: row.is_nullable === 'YES',
      default: row.column_default
    }));

    // Check if specific problematic columns exist
    const columnNames = columns.map(col => col.name);
    const problemColumns = {
      batch_id: columnNames.includes('batch_id'),
      batchid: columnNames.includes('batchid'),
      product_type: columnNames.includes('product_type'),
      producttype: columnNames.includes('producttype'),
      unit_weight: columnNames.includes('unit_weight'),
      unitweight: columnNames.includes('unitweight')
    };

    return NextResponse.json({
      success: true,
      table: 'waga_coffee_batches',
      columns,
      columnCount: columns.length,
      problemColumns,
      analysis: {
        hasSnakeCase: problemColumns.batch_id && problemColumns.product_type && problemColumns.unit_weight,
        hasCamelCase: problemColumns.batchid && problemColumns.producttype && problemColumns.unitweight,
        mixed: (problemColumns.batch_id || problemColumns.product_type) && (problemColumns.batchid || problemColumns.producttype)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database schema inspection failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}